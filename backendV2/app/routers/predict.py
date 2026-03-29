from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.service.Screenshot import capture
from app.service.detectElements import detect_elements
from app.service.RuleBasedComparator import compare_screenshots_rule_based

from app.modal import PredictRequest, PredictRequestByUrl, RuleBasedCompareRequest

# Router for upload prediction, URL capture, and rule-based screenshot comparison APIs.
router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.get("/")
async def get_prediction():
    return {"status": "success"}


@router.post("/GetPredictResult")
async def get_predict_result(payload: PredictRequest):
    # Keep results grouped by pair so the frontend can map responses back to its sidebar state.
    print(f"Received prediction request for user_id: {payload.user_id} with {len(payload.pair_list)} pairs.")
    results = detect_elements(payload)

    return {
        "status": "success",
        "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
        "results": results
    }


@router.post("/CaptureByUrl")
async def get_predict_result(payload: PredictRequestByUrl):
    try:
        # Capture both requested browser environments and return the saved screenshot locations.
        results = capture(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"CaptureByUrl failed: {exc}") from exc

    return {
        "status": "success",
        "message": f"Captured {len(results)} screenshots.",
        "results": results
    }


@router.post("/CompareRuleBased")
async def compare_rule_based(payload: RuleBasedCompareRequest):
    # Run the heavier visual regression analysis pipeline for one screenshot pair.
    results =  await compare_screenshots_rule_based(payload)
    return {
        "status": "success",
        "message": "Rule-based UI comparison finished.",
        "results": results,
    }

