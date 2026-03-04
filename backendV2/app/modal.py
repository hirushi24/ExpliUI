# from pydantic import BaseModel
# from typing import Optional, Any

# class ScreenshotMetaData(BaseModel):
#     image_id: int
#     image_name: str
#     image_base64: str
#     device_type: str  # mobile, desktop
#     browser: str  # chrome, firefox, safari
#     os: str  # windows, macos, android, ios

# class PairMeta(BaseModel):
#     pair_id: int
#     image_list: list[ScreenshotMetaData]

# class PredictRequest(BaseModel):
#     type : int # 1 = image, 2 url
#     user_id: int
#     pair_list: list[PairMeta]

# class savedPaths(BaseModel):
#     image_id: int
#     image_name: str
#     image_path: str
#     image_url: str

# class savedPairPaths(BaseModel):
#     pair_id: int
#     image_name: str
#     image_url: str
#     browser: str  # chrome, firefox, safari
#     os: str  # windows, macos
#     image_path: str

# class PredictionResult(BaseModel):
#     bug_probability: float
#     is_bug: bool
#     bug_type: Optional[str]
#     confidence: Optional[float]

# class ScreenshotMetaDataByUrl(BaseModel):
#     browser: str  # chrome, firefox, safari
#     os: str  # windows, macos
    

# class PredictRequestByUrl(BaseModel):
#     user_id: int
#     pair_id: int
#     image_url: str
#     image_list: list[ScreenshotMetaDataByUrl]


# #new
# from typing import Optional, Any

# class RuleCompareConfig(BaseModel):
#     conf_threshold: float = 0.25
#     min_match_score: float = 0.62
#     pixel_diff_threshold: float = 0.10
#     ssim_threshold: float = 0.90
#     edge_diff_threshold: float = 0.15
#     delta_e_threshold: float = 12.0
#     text_sim_threshold: float = 0.80

# class RuleCompareIssue(BaseModel):
#     type: str
#     severity: str
#     score: float
#     element_a: Optional[str] = None
#     element_b: Optional[str] = None
#     class_name: Optional[str] = None
#     match_score: Optional[float] = None
#     metrics: Optional[dict[str, Any]] = None
#     bbox_a: Optional[list[int]] = None
#     bbox_b: Optional[list[int]] = None

# class RuleCompareResult(BaseModel):
#     matched_pairs: int
#     only_in_a: int
#     only_in_b: int
#     overall_severity: str
#     issues: list[RuleCompareIssue]

# class PairRuleCompareResponse(BaseModel):
#     pair_id: int
#     image1: str
#     image2: str
#     rule_result: RuleCompareResult

from pydantic import BaseModel
from typing import Optional, Any

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


# #new
# from typing import Optional, Any

# class RuleCompareConfig(BaseModel):
#     conf_threshold: float = 0.25
#     min_match_score: float = 0.62
#     pixel_diff_threshold: float = 0.10
#     ssim_threshold: float = 0.90
#     edge_diff_threshold: float = 0.15
#     delta_e_threshold: float = 12.0
#     text_sim_threshold: float = 0.80

# class RuleCompareIssue(BaseModel):
#     type: str
#     severity: str
#     score: float
#     element_a: Optional[str] = None
#     element_b: Optional[str] = None
#     class_name: Optional[str] = None
#     match_score: Optional[float] = None
#     metrics: Optional[dict[str, Any]] = None
#     bbox_a: Optional[list[int]] = None
#     bbox_b: Optional[list[int]] = None

# class RuleCompareResult(BaseModel):
#     matched_pairs: int
#     only_in_a: int
#     only_in_b: int
#     overall_severity: str
#     issues: list[RuleCompareIssue]

# class PairRuleCompareResponse(BaseModel):
#     pair_id: int
#     image1: str
#     image2: str
#     rule_result: RuleCompareResult

    
class RuleBasedImageInput(BaseModel):
    image_name: str
    image_base64: str


class RuleBasedCompareRequest(BaseModel):
    user_id: int
    pair_id: int
    image_list: list[RuleBasedImageInput]