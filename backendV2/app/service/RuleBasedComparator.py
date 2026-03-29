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

# Rule-based screenshot comparison pipeline that combines detection, pixel diffing, and Gemini explanations.
load_dotenv()

@dataclass
class DetectedElement:
    # Normalized UI element shape used by the rule-based matching pipeline.
    class_name: str
    bbox: list[int]
    confidence: float
    text: str

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

async def compare_screenshots_rule_based(payload: RuleBasedCompareRequest) -> dict[str, Any]:
    if len(payload.image_list) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 screenshots are required for rule-based comparison")
    
    BEST_MODEL_PATH = os.getenv("UI_MODEL_PATH", "modelV4.pt")
    
    try:
        best_model = YOLO(BEST_MODEL_PATH)
        print("Model loaded successfully!")
    except Exception as e:
        print("Failed to load model:")
        print(e)

    saved_paths = _save_screenshots(payload.user_id, payload.pair_id, payload.image_list)

    # Read both screenshots once so the detector, heatmap, and pixel diff stages share the same image data.
    img1 = _read_image(saved_paths[0])
    img2 = _read_image(saved_paths[1])
    heatmap_url = _create_heatmap_image(payload.user_id, payload.pair_id, saved_paths[0], img1, img2)

    element_Json = get_ui_elements(saved_paths[0], saved_paths[1], best_model)

    baseline_json = element_Json["base_image_elements"]
    comparison_json = element_Json["comparison_image_elements"]

    matches, unmatched_first, unmatched_second = _match_elements(baseline_json, comparison_json)
    issues = _find_pixel_issues(img1, img2, matches)

    # If the pixel comparison finds nothing meaningful, skip the LLM call and return a lightweight result.
    if not issues:
        return {
            "images": {
                "baseline": str(saved_paths[0]),
                "candidate": str(saved_paths[1]),
                "heatmap": heatmap_url,
            },
            "issues": [],
            "explanations": [],
            "suggested_fix": "No significant UI issue detected from the provided JSON comparison.",
            "affected_css_properties": [],
            "summary": {
                "total_detected_baseline": len(baseline_json),
                "total_detected_candidate": len(comparison_json),
                "pixel_issues_found": len(issues),
                "highest_severity": _highest_severity(issues),
            },
        }

    # Only send matched elements to Gemini so the prompt stays focused on comparable UI regions.
    matched_baseline_elements = [m[0] for m in matches]
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

        Your goal is to identify meaningful UI differences between the two JSON inputs and explain them as frontend technical issues.

        Important rules:
        - Focus only on meaningful visual or structural UI changes such as:
        - shifted alignment
        - changed position
        - changed size
        - overlap
        - spacing inconsistency
        - layout breakage
        - missing visible text
        - broken text grouping
        - responsive layout shift
        - Ignore very low-confidence noise or unclear OCR fragments unless they clearly support a real UI issue.
        - Do not invent details that are not supported by the JSON comparison.
        - Base the result only on the provided JSON data, text values, bbox values, browser, and OS metadata.
        - Do not mention confidence scores unless absolutely necessary.
        - Keep the output technical, concise, and actionable.
        - SuggestedFix must be practical and CSS/frontend-oriented.
        - AffectedCSSProperties must contain only likely CSS properties related to the detected issues.
        - Return exactly one JSON object.
        - Return only valid JSON.
        - Do not include markdown fences.
        - Do not include any extra explanation before or after the JSON.

        Comparison instructions:
        - Compare elements using class, text similarity, and approximate bbox location.
        - Treat the same logical element as matched if text and position are reasonably similar.
        - Use bbox differences to detect layout changes.
        - Calculate and reason using approximate pixel differences such as:
        - horizontal shift = difference in x position
        - vertical shift = difference in y position
        - width change = difference in (x2 - x1)
        - height change = difference in (y2 - y1)
        - If a matched element moves significantly, describe it as alignment shift, spacing issue, or responsive layout inconsistency.
        - If an element exists in one JSON but not the other, describe it as missing or newly introduced only when strongly supported by the data.
        - Consider browser and OS differences only as possible rendering context, not as proof of root cause.

        Output format:
        {{
        "Issue": [
            "<issue 1, maximum 15 words>",
            "<issue 2, maximum 15 words>"
        ],
        "Explanation": [
            "<one sentence explaining issue 1 with evidence and approximate pixel differences>",
            "<one sentence explaining issue 2 with evidence and approximate pixel differences>"
        ],
        "SuggestedFix": "<technical suggestion to resolve the detected UI issues>",
        "AffectedCSSProperties": ["property1", "property2", "property3"]
        }}

        Strict output constraints:
        - "Issue" must be a list of short detected UI issues.
        - In "Issue", mention the baseline and comparison screenshot OS and browser to provide context.
        - Each item in "Issue" must contain at most 15 words.
        - "Explanation" must be a list with the same number of items as "Issue".
        - Each explanation must mention the baseline and comparison screenshot OS and browser to provide context.
        - Each explanation must explain the corresponding issue in exactly one sentence.
        - Each explanation must include evidence from the JSON comparison, including relevant text, bbox behavior, or approximate pixel differences where possible.
        - "SuggestedFix" must summarize the best technical frontend fix for the overall problem.
        - "AffectedCSSProperties" must be a list of likely CSS properties only.
        - If only one meaningful issue is found, return one item in "Issue" and one item in "Explanation".
        - If no meaningful issue is found, return:
            {{
                "Issue": [],
                "Explanation": [],
                "SuggestedFix": "No significant UI issue detected from the provided JSON comparison.",
                "AffectedCSSProperties": []
            }}

        baseline_json: {matched_baseline_elements}
        baseline_Screenshot_taken_OS: {payload.image_list[0].os}
        baseline_Screenshot_taken_Browser: {payload.image_list[0].browser}

        comparison_json: {matched_candidate_elements}
        comparison_Screenshot_taken_OS: {payload.image_list[1].os}
        comparison_Screenshot_taken_Browser: {payload.image_list[1].browser}
        """
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

    # Retry around quota errors so brief bursts do not fail the whole comparison request.
    raw_api_response = await call_gemini_with_retry(payload)

    print("Raw response from Gemini LLM:", raw_api_response)
        
    # Gemini returns the generated JSON string inside the nested candidates/content/parts structure.
    ai_text_response = raw_api_response['candidates'][0]['content']['parts'][0]['text']
    
    # Defensive cleanup for cases where the model wraps the JSON in markdown fences.
    cleaned_json_str = ai_text_response.strip().replace("```json", "").replace("```", "")
    
    result_data = json.loads(cleaned_json_str)

    return {
        "images": {
            "baseline": str(saved_paths[0]),
            "candidate": str(saved_paths[1]),
            "heatmap": heatmap_url,
        },
        "issues": result_data.get("Issue", []),
        "explanations": result_data.get("Explanation", []),
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
            path = upload_dir / shot.image_name
            
            # Prefer the request payload image when provided so repeated submissions refresh the stored file.
            if shot.image_base64:
                img_data = base64.b64decode(shot.image_base64.split(",")[-1])
                with open(path, "wb") as file:
                    file.write(img_data)
            # Otherwise reuse an already-saved image generated by an earlier capture step.
            elif not path.exists():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Image {shot.image_name} not found on server and no base64 provided."
                )
            
            saved_paths.append(path)
        except Exception as exc:
            if isinstance(exc, HTTPException):
                raise exc
            raise HTTPException(status_code=400, detail=f"Failed to save image {shot.image_name}: {exc}")
    return saved_paths


def _create_heatmap_image(user_id: int, pair_id: int, baseline_path: Path, img1: np.ndarray, img2: np.ndarray) -> str | None:
    try:
        if img1 is None or img2 is None:
            return None

        # Normalize dimensions before diffing so browser screenshots with slightly different sizes still compare.
        if img1.shape[:2] != img2.shape[:2]:
            img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]), interpolation=cv2.INTER_LINEAR)

        diff = cv2.absdiff(img1, img2)
        gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(img1, 0.45, heatmap, 0.55, 0)

        out_path = baseline_path.parent / "heatmap.png"
        cv2.imwrite(str(out_path), overlay)

        return f"/static/{user_id}/{pair_id}/{out_path.name}"
    except Exception:
        return None


def _read_image(path: Path) -> np.ndarray:
    image = cv2.imread(str(path))
    if image is None:
        raise HTTPException(status_code=400, detail=f"Unable to read image from path: {path}")
    return image

def get_ui_elements(img1_path, img2_path, model):
    # Detect elements independently in each screenshot and return a parallel structure for matching.
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
                    # OCR is limited to each detected bounding box so the downstream diff uses element-local text.
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
        class_name = _classify_region(w, h, aspect_ratio, area, image_area,
                                     has_text=False, is_blue=False,
                                     is_underlined=False, has_border=False)

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


def _classify_region(width: int, height: int, ratio: float, area: int, image_area: int,
                     has_text: bool = False, is_blue: bool = False, is_underlined: bool = False,
                     has_border: bool = False) -> str:
    normalized_area = area / max(image_area, 1)

    # image: large visual block
    if normalized_area > 0.16 and not has_text:
        return "image"

    # link: text-like, often blue/underlined
    if has_text and (is_blue or is_underlined) and height < 40:
        return "link"

    # button: medium rectangle, usually with text and border/fill
    if ratio > 2.5 and 24 <= height <= 90 and has_text:
        return "button"

    # field: wide rectangular input region
    if 1.8 <= ratio <= 12 and 20 <= height <= 75 and has_border:
        return "field"

    # text: fallback text region
    return "text"


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
            if source["class_name"] != target["class_name"]:
                continue

            # IoU gives us a simple geometric way to pair "same" elements across the two screenshots.
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

        # Compare aligned crops so the thresholds reflect visual change inside each matched element.
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
