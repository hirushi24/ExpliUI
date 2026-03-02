# import os
# import cv2
# import numpy as np
# import pytesseract
# from difflib import SequenceMatcher
# from scipy.optimize import linear_sum_assignment
# from skimage.metrics import structural_similarity as ssim
# from ultralytics import YOLO

# if os.name == "nt":
#     candidate = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
#     if os.path.exists(candidate):
#         pytesseract.pytesseract.tesseract_cmd = candidate
        
# UI_MODEL_PATH = os.getenv("UI_MODEL_PATH", "modelV2.pt")
# _ui_model = None


# def get_ui_model():
#     global _ui_model
#     if _ui_model is None:
#         _ui_model = YOLO(UI_MODEL_PATH)
#     return _ui_model


# def detect_ui_elements(image_path: str, conf_threshold: float = 0.25, extract_text: bool = True):
#     model = get_ui_model()
#     img = cv2.imread(image_path)
#     if img is None:
#         return []

#     results = model(image_path, conf=conf_threshold, imgsz=640, augment=True, verbose=False)
#     dets = []

#     for r in results:
#         if r.boxes is None:
#             continue
#         for i in range(len(r.boxes)):
#             cls_id = int(r.boxes.cls[i])
#             conf = float(r.boxes.conf[i])
#             x1, y1, x2, y2 = r.boxes.xyxy[i].cpu().numpy().astype(int)

#             text = ""
#             if extract_text:
#                 crop = img[max(0, y1):y2, max(0, x1):x2]
#                 if crop.size > 0:
#                     try:
#                         text = pytesseract.image_to_string(crop, config="--psm 6").strip()
#                     except Exception:
#                         text = ""

#             dets.append({
#                 "class": model.names[cls_id],
#                 "confidence": round(conf, 4),
#                 "bbox": [int(x1), int(y1), int(x2), int(y2)],
#                 "text": text
#             })

#     dets.sort(key=lambda d: d["confidence"], reverse=True)
#     return dets


# def _text_sim(a: str, b: str) -> float:
#     a = (a or "").strip().lower()
#     b = (b or "").strip().lower()
#     if not a and not b:
#         return 1.0
#     return SequenceMatcher(None, a, b).ratio()


# def _iou(box1, box2):
#     x1, y1, x2, y2 = box1
#     a1, b1, a2, b2 = box2
#     ix1, iy1 = max(x1, a1), max(y1, b1)
#     ix2, iy2 = min(x2, a2), min(y2, b2)
#     iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
#     inter = iw * ih
#     area1 = max(1, (x2 - x1) * (y2 - y1))
#     area2 = max(1, (a2 - a1) * (b2 - b1))
#     return inter / (area1 + area2 - inter + 1e-6)


# def _clamp_box(box, W, H):
#     x1, y1, x2, y2 = map(int, box)
#     x1 = max(0, min(x1, W - 1))
#     y1 = max(0, min(y1, H - 1))
#     x2 = max(1, min(x2, W))
#     y2 = max(1, min(y2, H))
#     if x2 <= x1:
#         x2 = min(W, x1 + 1)
#     if y2 <= y1:
#         y2 = min(H, y1 + 1)
#     return [x1, y1, x2, y2]


# def _normalize(dets, W, H, conf_min):
#     out = []
#     for i, d in enumerate(dets):
#         if d.get("confidence", 0.0) < conf_min:
#             continue
#         box = _clamp_box(d["bbox"], W, H)
#         x1, y1, x2, y2 = box
#         w, h = x2 - x1, y2 - y1
#         out.append({
#             "id": f'{d.get("class", "unk")}_{i}',
#             "class": d.get("class", "unknown"),
#             "conf": float(d.get("confidence", 0.0)),
#             "text": d.get("text", "") or "",
#             "bbox": box,
#             "cx": (x1 + x2) / 2.0,
#             "cy": (y1 + y2) / 2.0,
#             "w": w,
#             "h": h,
#             "area": w * h
#         })
#     return out


# def _estimate_affine(imgA, imgB):
#     gA = cv2.cvtColor(imgA, cv2.COLOR_BGR2GRAY)
#     gB = cv2.cvtColor(imgB, cv2.COLOR_BGR2GRAY)

#     orb = cv2.ORB_create(2000)
#     kA, dA = orb.detectAndCompute(gA, None)
#     kB, dB = orb.detectAndCompute(gB, None)

#     if dA is None or dB is None or len(kA) < 8 or len(kB) < 8:
#         return np.eye(2, 3, dtype=np.float32), False

#     matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
#     matches = matcher.match(dA, dB)
#     if len(matches) < 8:
#         return np.eye(2, 3, dtype=np.float32), False

#     matches = sorted(matches, key=lambda x: x.distance)[:300]
#     pA = np.float32([kA[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
#     pB = np.float32([kB[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

#     M, _ = cv2.estimateAffinePartial2D(pA, pB, method=cv2.RANSAC, ransacReprojThreshold=3.0)
#     if M is None:
#         return np.eye(2, 3, dtype=np.float32), False

#     return M.astype(np.float32), True


# def _transform_box(box, M):
#     x1, y1, x2, y2 = box
#     pts = np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32)
#     pts2 = cv2.transform(pts[None, :, :], M)[0]
#     return [int(pts2[:, 0].min()), int(pts2[:, 1].min()), int(pts2[:, 0].max()), int(pts2[:, 1].max())]


# def _roi_metrics(imgA, imgB, boxA, boxB):
#     x1, y1, x2, y2 = boxA
#     a1, b1, a2, b2 = boxB

#     cropA = imgA[y1:y2, x1:x2]
#     cropB = imgB[b1:b2, a1:a2]
#     if cropA.size == 0 or cropB.size == 0:
#         return {"ssim": 0.0, "pixel_diff": 1.0, "edge_diff": 1.0, "deltaE": 100.0}

#     cropB = cv2.resize(cropB, (cropA.shape[1], cropA.shape[0]), interpolation=cv2.INTER_AREA)

#     gA = cv2.cvtColor(cropA, cv2.COLOR_BGR2GRAY)
#     gB = cv2.cvtColor(cropB, cv2.COLOR_BGR2GRAY)

#     absd = cv2.absdiff(gA, gB)
#     pixel_diff = float((absd > 20).sum() / absd.size)
#     ssim_val = float(ssim(gA, gB, data_range=255))

#     eA = cv2.Canny(gA, 80, 160)
#     eB = cv2.Canny(gB, 80, 160)
#     edge_diff = float((cv2.absdiff(eA, eB) > 0).sum() / eA.size)

#     labA = cv2.cvtColor(cropA, cv2.COLOR_BGR2LAB).astype(np.float32)
#     labB = cv2.cvtColor(cropB, cv2.COLOR_BGR2LAB).astype(np.float32)
#     deltaE = np.sqrt(((labA - labB) ** 2).sum(axis=2)).mean()

#     return {"ssim": ssim_val, "pixel_diff": pixel_diff, "edge_diff": edge_diff, "deltaE": float(deltaE)}


# def _class_compat(c1, c2):
#     if c1 == c2:
#         return 1.0
#     groups = [
#         {"button", "field", "text"},
#         {"heading", "text"},
#         {"image", "icon", "button"},
#     ]
#     for g in groups:
#         if c1 in g and c2 in g:
#             return 0.6
#     return 0.0


# def _pair_score(a, b, imgA, imgB, diag):
#     iou_s = _iou(a["bbox"], b["bbox"])
#     dist = np.hypot(a["cx"] - b["cx"], a["cy"] - b["cy"]) / (diag + 1e-6)
#     dist_s = max(0.0, 1.0 - dist * 4.0)

#     wr = min(a["w"], b["w"]) / (max(a["w"], b["w"]) + 1e-6)
#     hr = min(a["h"], b["h"]) / (max(a["h"], b["h"]) + 1e-6)
#     size_s = (wr + hr) / 2.0

#     txt_s = _text_sim(a["text"], b["text"])
#     cls_s = _class_compat(a["class"], b["class"])

#     m = _roi_metrics(imgA, imgB, a["bbox"], b["bbox"])
#     vis_s = max(0.0, min(1.0, 0.7 * m["ssim"] + 0.3 * (1.0 - m["pixel_diff"])))

#     score = (
#         0.22 * cls_s +
#         0.22 * iou_s +
#         0.16 * dist_s +
#         0.10 * size_s +
#         0.14 * txt_s +
#         0.16 * vis_s
#     )

#     gate = sum([
#         iou_s >= 0.25,
#         dist <= 0.08,
#         txt_s >= 0.70,
#         m["ssim"] >= 0.65,
#     ]) >= 2

#     return score, gate


# def _match(A, B, imgA, imgB, min_score=0.62):
#     if not A or not B:
#         return [], list(range(len(A))), list(range(len(B)))

#     H, W = imgB.shape[:2]
#     diag = np.hypot(W, H)

#     n, m = len(A), len(B)
#     score_mat = np.zeros((n, m), dtype=np.float32)
#     gate_mat = np.zeros((n, m), dtype=np.bool_)

#     for i, a in enumerate(A):
#         for j, b in enumerate(B):
#             s, g = _pair_score(a, b, imgA, imgB, diag)
#             score_mat[i, j] = s
#             gate_mat[i, j] = g

#     cost = 1.0 - score_mat
#     ri, cj = linear_sum_assignment(cost)

#     matches, usedA, usedB = [], set(), set()
#     for i, j in zip(ri, cj):
#         if score_mat[i, j] >= min_score and gate_mat[i, j]:
#             matches.append((i, j, float(score_mat[i, j])))
#             usedA.add(i)
#             usedB.add(j)

#     onlyA = [i for i in range(n) if i not in usedA]
#     onlyB = [j for j in range(m) if j not in usedB]
#     return matches, onlyA, onlyB


# _IMPACT = {"field": 1.0, "button": 0.9, "heading": 0.85, "text": 0.6, "image": 0.5}


# def _sev(score):
#     if score >= 0.85:
#         return "critical"
#     if score >= 0.65:
#         return "high"
#     if score >= 0.45:
#         return "medium"
#     return "low"


# def compare_ui_pair_rule_based(
#     image_a_path: str,
#     image_b_path: str,
#     conf_threshold: float = 0.25,
#     min_match_score: float = 0.62,
#     pixel_diff_threshold: float = 0.10,
#     ssim_threshold: float = 0.90,
#     edge_diff_threshold: float = 0.15,
#     delta_e_threshold: float = 12.0,
#     text_sim_threshold: float = 0.80,
# ):
#     imgA = cv2.imread(image_a_path)
#     imgB = cv2.imread(image_b_path)
#     if imgA is None or imgB is None:
#         return {"error": "Could not read input images"}

#     HA, WA = imgA.shape[:2]
#     HB, WB = imgB.shape[:2]

#     rawA = detect_ui_elements(image_a_path, conf_threshold=conf_threshold, extract_text=True)
#     rawB = detect_ui_elements(image_b_path, conf_threshold=conf_threshold, extract_text=True)

#     A = _normalize(rawA, WA, HA, conf_min=conf_threshold)
#     B = _normalize(rawB, WB, HB, conf_min=conf_threshold)

#     M, _ = _estimate_affine(imgA, imgB)
#     A_aligned = []
#     for e in A:
#         e2 = e.copy()
#         e2["bbox"] = _clamp_box(_transform_box(e["bbox"], M), WB, HB)
#         x1, y1, x2, y2 = e2["bbox"]
#         e2["cx"], e2["cy"] = (x1 + x2) / 2.0, (y1 + y2) / 2.0
#         e2["w"], e2["h"] = x2 - x1, y2 - y1
#         e2["area"] = e2["w"] * e2["h"]
#         A_aligned.append(e2)

#     matches, onlyA_idx, onlyB_idx = _match(A_aligned, B, imgA, imgB, min_score=min_match_score)

#     issues = []

#     for ia, ib, mscore in matches:
#         a = A_aligned[ia]
#         b = B[ib]
#         metrics = _roi_metrics(imgA, imgB, a["bbox"], b["bbox"])
#         t_sim = _text_sim(a["text"], b["text"])

#         shift = np.hypot(a["cx"] - b["cx"], a["cy"] - b["cy"]) / (np.hypot(WB, HB) + 1e-6)
#         wr = max(a["w"], b["w"]) / (min(a["w"], b["w"]) + 1e-6)
#         hr = max(a["h"], b["h"]) / (min(a["h"], b["h"]) + 1e-6)

#         flags = {
#             "pixel_changed": (metrics["pixel_diff"] > pixel_diff_threshold) or (metrics["ssim"] < ssim_threshold),
#             "color_changed": metrics["deltaE"] > delta_e_threshold,
#             "structure_changed": metrics["edge_diff"] > edge_diff_threshold,
#             "text_changed": (a["text"].strip() or b["text"].strip()) and (t_sim < text_sim_threshold),
#             "moved": shift > 0.02,
#             "resized": wr > 1.12 or hr > 1.12,
#         }

#         for issue_type, is_on in flags.items():
#             if not is_on:
#                 continue

#             base = {
#                 "pixel_changed": 0.55,
#                 "color_changed": 0.60,
#                 "structure_changed": 0.60,
#                 "text_changed": 0.65,
#                 "moved": 0.45,
#                 "resized": 0.50,
#             }[issue_type]

#             impact = _IMPACT.get(a["class"], 0.5)
#             area_ratio = max(a["area"] / (WB * HB + 1e-6), b["area"] / (WB * HB + 1e-6))
#             top_fold = (a["cy"] < 0.4 * HB) or (b["cy"] < 0.4 * HB)

#             metric_bonus = 0.0
#             if issue_type == "pixel_changed":
#                 metric_bonus = min(0.20, metrics["pixel_diff"] * 0.8 + max(0.0, 0.95 - metrics["ssim"]) * 0.8)
#             elif issue_type == "color_changed":
#                 metric_bonus = min(0.20, (metrics["deltaE"] - delta_e_threshold) / 25.0)
#             elif issue_type == "structure_changed":
#                 metric_bonus = min(0.20, metrics["edge_diff"] * 0.7)
#             elif issue_type == "text_changed":
#                 metric_bonus = min(0.20, (0.9 - t_sim) * 0.5)

#             score = (
#                 base * 0.55
#                 + impact * 0.25
#                 + (0.08 if top_fold else 0.0)
#                 + min(0.08, area_ratio * 0.5)
#                 + metric_bonus
#             )
#             score = float(max(0.0, min(1.0, score)))

#             issues.append({
#                 "type": issue_type,
#                 "severity": _sev(score),
#                 "score": score,
#                 "element_a": a["id"],
#                 "element_b": b["id"],
#                 "class_name": a["class"],
#                 "match_score": mscore,
#                 "metrics": {
#                     **metrics,
#                     "text_sim": t_sim,
#                     "shift_norm": shift,
#                     "w_ratio": wr,
#                     "h_ratio": hr
#                 }
#             })

#     for i in onlyA_idx:
#         a = A_aligned[i]
#         score = 0.85 * 0.55 + _IMPACT.get(a["class"], 0.5) * 0.25 + (0.08 if a["cy"] < 0.4 * HB else 0.0)
#         issues.append({
#             "type": "missing_element",
#             "severity": _sev(score),
#             "score": float(score),
#             "element_a": a["id"],
#             "element_b": None,
#             "class_name": a["class"],
#             "bbox_a": a["bbox"]
#         })

#     for j in onlyB_idx:
#         b = B[j]
#         score = 0.55 * 0.55 + _IMPACT.get(b["class"], 0.5) * 0.25 + (0.08 if b["cy"] < 0.4 * HB else 0.0)
#         issues.append({
#             "type": "new_element",
#             "severity": _sev(score),
#             "score": float(score),
#             "element_a": None,
#             "element_b": b["id"],
#             "class_name": b["class"],
#             "bbox_b": b["bbox"]
#         })

#     issues.sort(key=lambda x: x["score"], reverse=True)

#     if not issues:
#         overall = "none"
#     else:
#         max_s = max(i["score"] for i in issues)
#         critical_n = sum(i["severity"] == "critical" for i in issues)
#         high_n = sum(i["severity"] == "high" for i in issues)
#         overall = "critical" if critical_n >= 1 or max_s >= 0.90 else "high" if high_n >= 2 or max_s >= 0.75 else "medium" if max_s >= 0.50 else "low"

#     return {
#         "matched_pairs": len(matches),
#         "only_in_a": len(onlyA_idx),
#         "only_in_b": len(onlyB_idx),
#         "overall_severity": overall,
#         "issues": issues,
#         "elements_a": A_aligned,
#         "elements_b": B
#     }