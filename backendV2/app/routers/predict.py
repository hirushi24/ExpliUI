from fastapi import APIRouter
from pydantic import BaseModel

from app.service.PredictUplaodImage import predict_result_by_image
from app.service.Screenshot import capture

from app.modal import PredictRequest, PredictRequestByUrl

# Check this line! It must be named 'router'
router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.get("/")
async def get_prediction():
    return {"status": "success"}


@router.post("/GetPredictResult")
async def get_predict_result(payload: PredictRequest):
    results = predict_result_by_image(payload)

    return {
        "status": "success",
        "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
        "results": results
    }


@router.post("/CaptureByUrl")
async def capture_image(payload: PredictRequestByUrl):
    results = capture(payload)

    return {
        "status": "success",
        "message": f"Captured {len(results)} screenshots.",
        "results": results
    }