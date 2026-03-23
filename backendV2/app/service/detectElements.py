import base64
from http.client import HTTPException
import os
from pathlib import Path
import pytesseract
import cv2

from app.modal import PredictRequest, ScreenshotMetaData, savedPaths
from dotenv import load_dotenv
from ultralytics import YOLO

# Load variables from a .env file if it exists
load_dotenv()

def detect_elements(predict_request: PredictRequest):
    
    BEST_MODEL_PATH = os.getenv("UI_MODEL_PATH", "C:/Users/Hirushi Silva/Documents/Main/ExpliUI/backendV2/modelV2.pt")
    
    try:
        best_model = YOLO(BEST_MODEL_PATH)
        print("Model loaded successfully!")
    except Exception as e:
        print("Failed to load model:")
        print(e)

    results = []

    # Iterate through each pair in the request
    for pair in predict_request.pair_list:
        pair_id = pair.pair_id
        screenshots = pair.image_list
        
        # Save the screenshots and get their file paths
        saved_paths = save_screenshots(predict_request.user_id, pair_id, screenshots)
        
        img1_path = saved_paths[0].image_path  # base image path
        img2_path = saved_paths[1].image_path # comparison image path

        element_Json = get_ui_elements(img1_path, img2_path, best_model)

        results.append({
            "pair_id": pair_id,
            "image1": saved_paths[0].image_url,  # base imag
            "image2": saved_paths[1].image_url, # comparison image
            "image1_device_type": saved_paths[0].device_type,
            "image2_device_type": saved_paths[1].device_type,
            "image1_browser": saved_paths[0].browser,
            "image2_browser": saved_paths[1].browser,   
            "element_Json": element_Json
        })

        print(f"Saved screenshots for pair_id {pair_id}: {saved_paths}")
  
    return results


def get_ui_elements(img1_path, img2_path, model):
    elements_img1 = detect_ui_elements(img1_path, model)
    elements_img2 = detect_ui_elements(img2_path, model)

    return {
        "base_image_elements": elements_img1,
        "comparison_image_elements": elements_img2
    }

def save_screenshots(user_id: int, pair_id: int, screenshots: list[ScreenshotMetaData]):
    upload_dir = Path(f"upload_image/{user_id}/{pair_id}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # base_url =  os.getenv("BASE_URL", "http://localhost:8000/static")  # Fallback to a default if not set
    # base_url = "http://127.0.0.1:8080/static"
    base_url = "/static"
    saved_paths = []

    for snack in screenshots:
        try:
            # Decode the base64 image
            img_data = base64.b64decode(snack.image_base64.split(",")[-1])
            file_path = upload_dir / f"{snack.image_name}"
            
            # Save the file to disk
            with open(file_path, "wb") as f:
                f.write(img_data)
            
            # Convert Path object to a string for Pydantic validation
            path_string = file_path.as_posix() 
            
            file_url = f"{base_url}/{user_id}/{pair_id}/{snack.image_name}"
            
            saved_path = savedPaths(
                image_id=snack.image_id,
                image_name=snack.image_name,
                image_path=path_string,
                image_url=file_url,
                device_type=snack.device_type,
                browser=snack.browser,
            )
            saved_paths.append(saved_path)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to save image {snack.image_name}: {str(e)}")
            
    return saved_paths




def detect_ui_elements(image_path, model, conf_threshold=0.25,
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
                'class':      model.names[cls_id],
                'confidence': round(conf, 4),
                'bbox':       [int(x1), int(y1), int(x2), int(y2)],
                'text':       text
            })

    # Sort by confidence
    detections.sort(key=lambda d: d['confidence'], reverse=True)
    return detections

print("detect_ui_elements() ready!")