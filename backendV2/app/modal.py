from pydantic import BaseModel
from typing import Optional, Any

# Shared request and response models for upload, URL capture, and comparison endpoints.
class ScreenshotMetaData(BaseModel):
    image_id: int
    image_name: str
    image_base64: str
    device_type: str  # mobile, desktop
    browser: str  # chrome, firefox, safari
    os: str  # windows, macos, android, ios

class PairMeta(BaseModel):
    pair_id: int
    image_list: list[ScreenshotMetaData]

class PredictRequest(BaseModel):
    type : int # 1 = image, 2 url
    user_id: int
    pair_list: list[PairMeta]

class savedPaths(BaseModel):
    image_id: int
    image_name: str
    image_path: str
    image_url: str
    device_type: str
    browser: str

class savedPairPaths(BaseModel):
    pair_id: int
    image_name: str
    image_url: str
    browser: str  # chrome, firefox, safari
    os: str  # windows, macos
    image_path: str

class PredictionResult(BaseModel):
    bug_probability: float
    is_bug: bool
    bug_type: Optional[str]
    confidence: Optional[float]

class ScreenshotMetaDataByUrl(BaseModel):
    browser: str  # chrome, firefox, safari
    os: str  # windows, macos
    

class PredictRequestByUrl(BaseModel):
    user_id: int
    pair_id: int
    image_url: str
    image_list: list[ScreenshotMetaDataByUrl]

class RuleBasedImageInput(BaseModel):
    image_name: str
    image_base64: Optional[str] = None
    browser: Optional[str] = None  # chrome, firefox, safari
    os: Optional[str] = None  # windows, macos
    device_type: Optional[str] = None  # mobile, desktop


class RuleBasedCompareRequest(BaseModel):
    user_id: int
    pair_id: int
    image_list: list[RuleBasedImageInput]
