
import base64
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv
import os
import sys
from fastapi import HTTPException
import numpy as np
import torch
import timm
from app.modal import PredictRequest, ScreenshotMetaData, savedPaths, PredictionResult
import albumentations as A
from albumentations.pytorch import ToTensorV2

# Load variables from a .env file if it exists
load_dotenv()

# --- STEP 1: class definition ---
class SiameseEfficientNet(torch.nn.Module):
    def __init__(self, num_classes=5):
        super(SiameseEfficientNet, self).__init__()

        self.backbone = timm.create_model("efficientnet_b0", pretrained=True, num_classes=0)
        self.feature_dim = self.backbone.num_features

        self.fc = torch.nn.Sequential(
            torch.nn.Linear(self.feature_dim, 512),
            torch.nn.BatchNorm1d(512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(512, 256),
            torch.nn.ReLU()
        )

        self.binary_head = torch.nn.Linear(256, 1)
        self.class_head = torch.nn.Linear(256, num_classes)

    def forward_one(self, x):
        x = self.backbone(x)
        x = self.fc(x)
        return x

    def forward(self, img1, img2):
        feat1 = self.forward_one(img1)
        feat2 = self.forward_one(img2)
        diff = torch.abs(feat1 - feat2)
        return self.binary_head(diff), self.class_head(diff)

# Get the path from environment variables, with a "fallback" default
MODEL_PATH = os.getenv("MODEL_PATH", "C:/Users/Hirushi Silva/Documents/ExpliUI_Project (FYP)/backendV2/backendV2/modelV1.pt")
# Ensure the class is available under __main__ for legacy pickles
main_mod = sys.modules.get("__main__")
if main_mod is not None:
    setattr(main_mod, "SiameseEfficientNet", SiameseEfficientNet)

model = None
try:
    # Load the pickled model (the file contains the class object)
    model = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
    if hasattr(model, "eval"):
        model.eval()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")


def predict_result_by_image(predict_request: PredictRequest):

    results = []

    # Iterate through each pair in the request
    for pair in predict_request.pair_list:
        pair_id = pair.pair_id
        screenshots = pair.image_list
        if predict_request.type == 1 :
            # Save the screenshots and get their file paths
            saved_paths = save_screenshots(predict_request.user_id, pair_id, screenshots)
            img1_path = saved_paths[0].image_path
            img2_path = saved_paths[1].image_path
            prediction = predict_ui_bug(img1_path, img2_path, model)
            results.append({
                "pair_id": pair_id,
                "image1": saved_paths[0].image_url,
                "image2": saved_paths[1].image_url,
                "prediction": prediction
            })
            print(f"Saved screenshots for pair_id {pair_id}: {saved_paths}")
        else:
            img1_path = predict_request.pair_list[0].image_list[0].image_base64
            img2_path = predict_request.pair_list[0].image_list[1].image_base64
            prediction = predict_ui_bug(img1_path, img2_path, model)
            results.append({
                "pair_id": pair_id,
                "image1": predict_request.pair_list[0].image_list[0].image_name, #image url at this time
                "image2": predict_request.pair_list[0].image_list[1].image_name, #image url at this time
                "prediction": prediction
            })
  
    return results

def save_screenshots(user_id: int, pair_id: int, screenshots: list[ScreenshotMetaData]):
    upload_dir = Path(f"upload_image/{user_id}/{pair_id}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    base_url = "http://127.0.0.1:8080/static"
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
            # .as_posix() is safer than str() for web-bound paths
            path_string = file_path.as_posix() 
            
            file_url = f"{base_url}/{user_id}/{pair_id}/{snack.image_name}"
            
            saved_path = savedPaths(
                image_id=snack.image_id,
                image_name=snack.image_name,
                image_path=path_string,  # <--- string version 
                image_url=file_url
            )
            saved_paths.append(saved_path)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to save image {snack.image_name}: {str(e)}")
            
    return saved_paths

def predict_ui_bug(img1_path, img2_path, model):
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        # 1. Load with PIL and convert to RGB
        img1_pil = Image.open(img1_path).convert("RGB")
        img2_pil = Image.open(img2_path).convert("RGB")
    except Exception as e:
        print(f"Error loading images: {e}")
        return {"error": "Error loading images"}
    
    try:
        # 2. Preprocess images to tensors
        img1_tensor = preprocess_infer(img1_pil).unsqueeze(0).to(torch.device('cpu'))
        img2_tensor = preprocess_infer(img2_pil).unsqueeze(0).to(torch.device('cpu'))
    except Exception as e:
        print(f"Error preprocessing images: {e}")
        return {"error": f"Error preprocessing images: {str(e)}"}
    
    with torch.no_grad():
        out_bin, out_cls = model(img1_tensor, img2_tensor)
        prob_bug = torch.sigmoid(out_bin).item()
        is_bug = prob_bug > 0.5
        pred_idx = out_cls.argmax(1).item()
        confidence = torch.softmax(out_cls, dim=1)[0][pred_idx].item()

    label_map_rev = {0: "Normal", 1: "Layout Issue", 2: "Content Issue", 3: "Missing Element", 4: "Overflow Issue"}
    pred_label = label_map_rev.get(pred_idx, "Unknown")

    result = PredictionResult(
        bug_probability=prob_bug,
        is_bug=is_bug,
        bug_type=pred_label if is_bug else None,
        confidence=confidence if is_bug else None
    )

    return result


transform = A.Compose([
    # Resize so the longest side is 512, keeping the aspect ratio
    A.LongestMaxSize(max_size=512),
    # Add padding (black bars) to reach exactly 512x512
    A.PadIfNeeded(min_height=512, min_width=512, border_mode=0),
    A.Normalize(),
    ToTensorV2()
])

def preprocess_infer(image_pil):
    """Convert PIL image to tensor using albumentations transforms."""
    image_np = np.array(image_pil)
    augmented = transform(image=image_np)
    return augmented["image"]