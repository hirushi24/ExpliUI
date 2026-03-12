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



# import os
# import cv2
# import numpy as np
# import pytesseract
# from difflib import SequenceMatcher
# from scipy.optimize import linear_sum_assignment
# from skimage.metrics import structural_similarity as ssim
# from ultralytics import YOLO


# UI_MODEL_PATH = os.getenv("UI_MODEL_PATH", "modelV2.pt")
# _ui_model = None


# def get_ui_model():
#     global _ui_model
#     if _ui_model is None:
#         _ui_model = YOLO(UI_MODEL_PATH)
#     return _ui_model


# # Optional Windows fallback for Tesseract
# if os.name == "nt":
#     t_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
#     if os.path.exists(t_path):
#         pytesseract.pytesseract.tesseract_cmd = t_path


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

#     score = 0.22 * cls_s + 0.22 * iou_s + 0.16 * dist_s + 0.10 * size_s + 0.14 * txt_s + 0.16 * vis_s

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

#             score = (
#                 base * 0.55
#                 + impact * 0.25
#                 + (0.08 if top_fold else 0.0)
#                 + min(0.08, area_ratio * 0.5)
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

import base64
from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import google.generativeai as genai
import os
import asyncio
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
from ultralytics import YOLO

from app.modal import RuleBasedCompareRequest

load_dotenv()

@dataclass
class DetectedElement:
    class_name: str
    bbox: list[int]
    confidence: float
    text: str

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

async def compare_screenshots_rule_based(payload: RuleBasedCompareRequest) -> dict[str, Any]:
    if len(payload.image_list) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 screenshots are required for rule-based comparison")
    
    BEST_MODEL_PATH = os.getenv("UI_MODEL_PATH", "C:/Users/Hirushi Silva/Documents/Main/ExpliUI/backendV2/modelV3.pt")
    
    try:
        best_model = YOLO(BEST_MODEL_PATH)
        print("Model loaded successfully!")
    except Exception as e:
        print("Failed to load model:")
        print(e)

    saved_paths = _save_screenshots(payload.user_id, payload.pair_id, payload.image_list)

    img1 = _read_image(saved_paths[0])
    img2 = _read_image(saved_paths[1])

    #elements_1 = _detect_ui_elements(img1)
   # elements_2 = _detect_ui_elements(img2)

    element_Json = get_ui_elements(saved_paths[0], saved_paths[1], best_model)

    baseline_json = element_Json["base_image_elements"]
    comparison_json = element_Json["comparison_image_elements"]

    matches, unmatched_first, unmatched_second = _match_elements(baseline_json, comparison_json)
    issues = _find_pixel_issues(img1, img2, matches)

    # Now, extract just the 'source' elements from the matches
    matched_baseline_elements = [m[0] for m in matches]

    # If you also need the 'target' elements from the second image:
    matched_candidate_elements = [m[1] for m in matches]

    user_prompt = f"""
        You are a frontend UI regression analysis assistant.

        Your task is to compare two JSON arrays extracted from two separate webpage screenshots:
        1. "baseline_json" = expected/original UI elements
        2. "baseline_Screenshot_taken_OS" = OS of the baseline screenshot
        3. "baseline_Screenshot_taken_Browser" = Browser of the baseline screenshot
        4. "comparison_json" = changed/new UI elements
        5. "comparison_Screenshot_taken_OS" = OS of the comparison screenshot
        6. "comparison_Screenshot_taken_Browser" = Browser of the comparison screenshot

        Each element may contain:
        - class: UI element type such as button, link, text, image, field, heading
        - confidence: detection confidence score
        - bbox: [x1, y1, x2, y2]
        - text: OCR-extracted visible text

        Your goal is to identify meaningful UI differences between the two JSON inputs and explain them as a frontend technical issue.

        Important rules:
        - Focus only on meaningful visual or structural UI changes such as:
        - missing elements
        - newly appeared elements
        - shifted alignment
        - changed position
        - changed size
        - text truncation
        - overlap
        - wrong element type classification if strongly implied by context
        - spacing inconsistency
        - layout breakage
        - Ignore very low-confidence noise or unclear OCR fragments unless they clearly contribute to a visible issue.
        - Do not mention confidence scores in the final answer unless essential for reasoning.
        - Do not invent details that are not supported by the JSON comparison.
        - Base the explanation only on the provided JSON data.
        - Keep the explanation technical, concise, and actionable.
        - Suggested fixes must be practical frontend/CSS-oriented recommendations.
        - AffectedCSSProperties must contain only likely CSS properties related to the issue.
        - Return exactly one JSON object.
        - Return only valid JSON.
        - Do not include markdown fences.
        - Do not include any extra explanation before or after the JSON.

        Output format:
        {{
        "Issue": "<technical explanation of the detected UI issue>",
        "SuggestedFix": "<technical suggestion to resolve the issue>",
        "AffectedCSSProperties": ["property1", "property2"]
        }}

        Reasoning guidance:
        - Compare elements by class, text similarity, and approximate bbox location.
        - If text in one image appears truncated, broken, split, or partially missing in the other image, describe it as likely text overflow, wrapping, clipping, or container sizing issue.
        - If the same logical element exists in both but its bbox significantly changes, describe it as alignment, spacing, or responsive layout shift.
        - If an element appears only in one JSON, describe it as missing or newly introduced UI component.
        - If multiple nearby text/link elements become fragmented, infer possible layout compression, wrapping, or overflow issues.

        baseline_json: {matched_baseline_elements}
		baseline_Screenshot_taken_OS: {payload.image_list[0].os}
		baseline_Screenshot_taken_Browser: {payload.image_list[0].browser}

        comparison_json: {matched_candidate_elements}
		comparison_Screenshot_taken_OS: {payload.image_list[1].os}
		comparison_Screenshot_taken_Browser: {payload.image_list[1].browser}
    """
    # The user prompt is designed to guide the Gemini LLM in analyzing the two sets of detected UI elements and generating a concise technical explanation of any meaningful differences, along with practical suggestions for fixes and relevant CSS properties. The prompt emphasizes the importance of focusing on significant visual or structural changes while ignoring low-confidence noise, and it instructs the model to return only valid JSON without any extraneous text.
    payload = {
        "contents": [
            {
                "parts": [{"text": user_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    print("Payload sent to Gemini LLM:", payload)

    #call Gemmini LLM and get the response with retry logic for quota handling
    raw_api_response = await call_gemini_with_retry(payload)

    print("Raw response from Gemini LLM:", raw_api_response)
        
    # The text is hidden inside candidates -> content -> parts
    ai_text_response = raw_api_response['candidates'][0]['content']['parts'][0]['text']
    
    # We strip in case there is leading/trailing whitespace or markdown
    cleaned_json_str = ai_text_response.strip().replace("```json", "").replace("```", "")
    
    result_data = json.loads(cleaned_json_str)

    return {
        "images": {
            "baseline": str(saved_paths[0]),
            "candidate": str(saved_paths[1]),
        },
        "elements": {
            "baseline": [_element_to_json(item) for item in baseline_json],
            "candidate": [_element_to_json(item) for item in comparison_json],
        },
        "matching": {
            "matched_count": len(matches),
            "unmatched_baseline": [_element_to_json(item) for item in unmatched_first],
            "unmatched_candidate": [_element_to_json(item) for item in unmatched_second],
        },
        "issues": result_data.get("Issue", ""),
        "suggested_fix": result_data.get("SuggestedFix", ""),
        "affected_css_properties": result_data.get("AffectedCSSProperties", []),
        "summary": {
            "total_detected_baseline": len(baseline_json),
            "total_detected_candidate": len(comparison_json),
            "pixel_issues_found": len(issues),
            "highest_severity": _highest_severity(issues),
        },
    }

async def call_gemini_with_retry(payload, retries=3, backoff_in_seconds=1):
    print("Calling Gemini LLM with payload:")
    async with httpx.AsyncClient() as client:
        for i in range(retries):
            response = await client.post(GEMINI_URL, json=payload)
            
            if response.status_code == 429:
                # Get the retry delay from the error if possible, else use backoff
                wait_time = backoff_in_seconds * (2 ** i) 
                print(f"Quota hit. Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
                
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
                
            return response.json()
            
        raise HTTPException(status_code=429, detail="Exceeded retries after hitting quota.")


def _save_screenshots(user_id: int, pair_id: int, screenshots: list) -> list[Path]:
    upload_dir = Path(f"upload_image/{user_id}/{pair_id}")
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_paths = []
    for shot in screenshots:
        try:
            img_data = base64.b64decode(shot.image_base64.split(",")[-1])
            path = upload_dir / shot.image_name
            with open(path, "wb") as file:
                file.write(img_data)
            saved_paths.append(path)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Failed to save image {shot.image_name}: {exc}")
    return saved_paths


def _read_image(path: Path) -> np.ndarray:
    image = cv2.imread(str(path))
    if image is None:
        raise HTTPException(status_code=400, detail=f"Unable to read image from path: {path}")
    return image

def get_ui_elements(img1_path, img2_path, model):
    elements_img1 = detect_ui_elements_yolo(img1_path, model)
    elements_img2 = detect_ui_elements_yolo(img2_path, model)

    return {
        "base_image_elements": elements_img1,
        "comparison_image_elements": elements_img2
    }

def detect_ui_elements_yolo(image_path, model, conf_threshold=0.25,
                       extract_text=True, visualize=False):
    """
    Run YOLOv8 detection on a screenshot.
    Returns list of dicts with class, confidence, bbox, text.
    """
    results = model(image_path, conf=conf_threshold, imgsz=640, verbose=False)
    detections = []

    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i])
            conf   = float(boxes.conf[i])
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy().astype(int)

            text = ''
            if extract_text:
                try:
                    img = cv2.imread(image_path)
                    crop = img[max(0,y1):y2, max(0,x1):x2]
                    if crop.size > 0:
                        text = pytesseract.image_to_string(
                            crop, config='--psm 6').strip()
                except:
                    text = ''

            detections.append({
                'class_name':      model.names[cls_id],
                'confidence': round(conf, 4),
                'bbox':       [int(x1), int(y1), int(x2), int(y2)],
                'text':       text
            })

    # Sort by confidence
    detections.sort(key=lambda d: d['confidence'], reverse=True)
    return detections



def _detect_ui_elements(image: np.ndarray) -> list[DetectedElement]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    edges = cv2.Canny(blur, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    height, width = gray.shape
    image_area = height * width

    elements: list[DetectedElement] = []
    for index, contour in enumerate(contours):
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h

        if area < image_area * 0.0004:
            continue
        if w < 18 or h < 12:
            continue

        aspect_ratio = w / max(h, 1)
        class_name = _classify_region(w, h, aspect_ratio, area, image_area)

        confidence = _confidence_from_geometry(w, h, area, image_area)
        elements.append(
            DetectedElement(
                class_name=class_name,
                bbox=[x, y, x + w, y + h],
                confidence=round(confidence, 4),
                text=""
                
            )
        )

    elements.sort(key=lambda item: item.confidence, reverse=True)
    return elements


def _classify_region(width: int, height: int, ratio: float, area: int, image_area: int) -> str:
    normalized_area = area / max(image_area, 1)

    if ratio > 2.5 and 24 <= height <= 90:
        return "button"
    if 1.8 <= ratio <= 12 and 20 <= height <= 75:
        return "field"
    if normalized_area > 0.16:
        return "image"
    if ratio > 3.2 and height < 28:
        return "text"
    if ratio > 1.6 and 28 <= height <= 120:
        return "heading"
    return "container"


def _confidence_from_geometry(width: int, height: int, area: int, image_area: int) -> float:
    area_score = min(1.0, (area / max(image_area * 0.03, 1)))
    shape_score = 1.0 if width > height else 0.75
    return float(0.45 + 0.35 * area_score + 0.2 * shape_score)


def _iou(box1: list[int], box2: list[int]) -> float:
    x11, y11, x12, y12 = box1
    x21, y21, x22, y22 = box2

    inter_x1 = max(x11, x21)
    inter_y1 = max(y11, y21)
    inter_x2 = min(x12, x22)
    inter_y2 = min(y12, y22)

    inter_w = max(0, inter_x2 - inter_x1)
    inter_h = max(0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h

    if inter_area == 0:
        return 0.0

    area1 = max(0, x12 - x11) * max(0, y12 - y11)
    area2 = max(0, x22 - x21) * max(0, y22 - y21)

    return inter_area / max(area1 + area2 - inter_area, 1)


def _match_elements(first: list[DetectedElement], second: list[DetectedElement]):
    second_pool = second.copy()
    matches = []
    unmatched_first = []

    for source in first:
        best_index = -1
        best_score = 0.0

        for index, target in enumerate(second_pool):
            source["class_name"]
            if source["class_name"] != target["class_name"]:
                continue

            overlap = _iou(source["bbox"], target["bbox"])
            if overlap > best_score:
                best_score = overlap
                best_index = index

        if best_index >= 0 and best_score >= 0.2:
            target = second_pool.pop(best_index)
            matches.append((source, target, best_score))
        else:
            unmatched_first.append(source)

    unmatched_second = second_pool
    return matches, unmatched_first, unmatched_second


def _crop(image: np.ndarray, bbox: list[int]) -> np.ndarray:
    x1, y1, x2, y2 = bbox
    return image[max(y1, 0):max(y2, 0), max(x1, 0):max(x2, 0)]


def _find_pixel_issues(img1: np.ndarray, img2: np.ndarray, matches) -> list[dict[str, Any]]:
    issues = []

    for base_item, cand_item, overlap in matches:
        crop1 = _crop(img1, base_item["bbox"])
        crop2 = _crop(img2, cand_item["bbox"])
        if crop1.size == 0 or crop2.size == 0:
            continue

        h = min(crop1.shape[0], crop2.shape[0])
        w = min(crop1.shape[1], crop2.shape[1])

        crop1 = cv2.resize(crop1, (w, h), interpolation=cv2.INTER_AREA)
        crop2 = cv2.resize(crop2, (w, h), interpolation=cv2.INTER_AREA)

        diff = cv2.absdiff(crop1, crop2)
        gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        changed_mask = gray > 25
        changed_ratio = float(np.count_nonzero(changed_mask)) / max(gray.size, 1)
        mean_abs_diff = float(np.mean(gray))
        max_diff = int(np.max(gray))

        has_issue = changed_ratio >= 0.04 or mean_abs_diff >= 12
        if not has_issue:
            continue

        severity = _severity(changed_ratio, mean_abs_diff, base_item["bbox"], img1.shape)

        issues.append(
            {
                "class": base_item["class_name"],
                "bbox_baseline": base_item["bbox"],
                "bbox_candidate": cand_item["bbox"],
                "iou": round(overlap, 4),
                "pixel_metrics": {
                    "changed_pixel_ratio": round(changed_ratio, 4),
                    "mean_abs_diff": round(mean_abs_diff, 2),
                    "max_abs_diff": max_diff,
                },
                "severity": severity,
                "issue_type": _issue_type(base_item["class_name"], changed_ratio, mean_abs_diff),
            }
        )

    issues.sort(
        key=lambda issue: (
            _severity_rank(issue["severity"]),
            issue["pixel_metrics"]["changed_pixel_ratio"],
            issue["pixel_metrics"]["mean_abs_diff"],
        ),
        reverse=True,
    )
    return issues


def _severity(changed_ratio: float, mean_abs_diff: float, bbox: list[int], image_shape: tuple[int, int, int]) -> str:
    x1, y1, x2, y2 = bbox
    element_area = max(1, (x2 - x1) * (y2 - y1))
    page_area = max(1, image_shape[0] * image_shape[1])
    impact = element_area / page_area

    if changed_ratio >= 0.45 or mean_abs_diff >= 75:
        return "critical"
    if changed_ratio >= 0.25 or mean_abs_diff >= 45 or impact >= 0.2:
        return "high"
    if changed_ratio >= 0.12 or mean_abs_diff >= 25:
        return "medium"
    return "low"


def _issue_type(class_name: str, changed_ratio: float, mean_abs_diff: float) -> str:
    if class_name in {"button", "field"} and changed_ratio >= 0.2:
        return "layout_shift"
    if class_name in {"text", "heading"} and mean_abs_diff >= 20:
        return "content_or_font_change"
    if class_name == "image" and changed_ratio >= 0.3:
        return "image_render_difference"
    return "visual_regression"


def _severity_rank(level: str) -> int:
    ranks = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    return ranks.get(level, 0)


def _highest_severity(issues: list[dict[str, Any]]) -> str | None:
    if not issues:
        return None
    return max((issue["severity"] for issue in issues), key=_severity_rank)


def _element_to_json(item: DetectedElement) -> dict[str, Any]:
    
    return {
        "class_name": item["class_name"],
        "confidence": item["confidence"],
        "bbox": item["bbox"],
        "text": item["text"]
    }
