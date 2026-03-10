# from fastapi import APIRouter
# from pydantic import BaseModel

# from app.service.PredictUplaodImage import predict_result_by_image
# from app.service.Screenshot import capture

# from app.modal import PredictRequest, PredictRequestByUrl

# # Check this line! It must be named 'router'
# router = APIRouter(prefix="/predict", tags=["Prediction"])


# @router.get("/")
# async def get_prediction():
#     return {"status": "success"}


# @router.post("/GetPredictResult") 
# async def get_predict_result(payload: PredictRequest):
#     results = predict_result_by_image(payload)

#     return {
#         "status": "success",
#         "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
#         "results": results
#     }


# @router.post("/CaptureByUrl")
# async def capture_image(payload: PredictRequestByUrl):
#     results = capture(payload)

#     return {
#         "status": "success",
#         "message": f"Captured {len(results)} screenshots.",
#         "results": results
#     }





# # from fastapi import APIRouter
# # from app.service.PredictUplaodImage import predict_result_by_image, save_screenshots
# # from app.service.Screenshot import capture
# # from app.service.UIRuleCompare import compare_ui_pair_rule_based
# # from app.modal import PredictRequest, PredictRequestByUrl

# # router = APIRouter(prefix="/predict", tags=["Prediction"])


# # @router.get("/")
# # async def get_prediction():
# #     return {"status": "success"}


# # @router.post("/GetPredictResult")
# # async def get_predict_result(payload: PredictRequest):
# #     results = predict_result_by_image(payload)

# #     return {
# #         "status": "success",
# #         "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
# #         "results": results
# #     }


# # @router.post("/CompareElementsRuleBased")
# # async def compare_elements_rule_based(payload: PredictRequest):
# #     results = []

# #     for pair in payload.pair_list:
# #         pair_id = pair.pair_id
# #         screenshots = pair.image_list

# #         if payload.type == 1:
# #             saved_paths = save_screenshots(payload.user_id, pair_id, screenshots)
# #             img1_path = saved_paths[0].image_path
# #             img2_path = saved_paths[1].image_path

# #             rule_result = compare_ui_pair_rule_based(
# #                 image_a_path=img1_path,
# #                 image_b_path=img2_path
# #             )

# #             results.append({
# #                 "pair_id": pair_id,
# #                 "image1": saved_paths[0].image_url,
# #                 "image2": saved_paths[1].image_url,
# #                 "rule_result": rule_result
# #             })
# #         else:
# #             img1_path = payload.pair_list[0].image_list[0].image_base64
# #             img2_path = payload.pair_list[0].image_list[1].image_base64

# #             rule_result = compare_ui_pair_rule_based(
# #                 image_a_path=img1_path,
# #                 image_b_path=img2_path
# #             )

# #             results.append({
# #                 "pair_id": pair_id,
# #                 "image1": payload.pair_list[0].image_list[0].image_name,
# #                 "image2": payload.pair_list[0].image_list[1].image_name,
# #                 "rule_result": rule_result
# #             })

# #     return {
# #         "status": "success",
# #         "message": f"Compared {len(results)} screenshot pairs using rule-based engine.",
# #         "results": results
# #     }


# # @router.post("/CaptureByUrl")
# # async def capture_image(payload: PredictRequestByUrl):
# #     results = capture(payload)

# #     return {
# #         "status": "success",
# #         "message": f"Captured {len(results)} screenshots.",
# #         "results": results
# #     }



from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

#from app.service.PredictUplaodImage import predict_result_by_image
from app.service.Screenshot import capture
from app.service.detectElements import detect_elements
from app.service.RuleBasedComparator import compare_screenshots_rule_based

from app.modal import PredictRequest, PredictRequestByUrl, RuleBasedCompareRequest

# Check this line! It must be named 'router'
router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.get("/")
async def get_prediction():
    return {"status": "success"}


@router.post("/GetPredictResult")
async def get_predict_result(payload: PredictRequest):

    print(f"Received prediction request for user_id: {payload.user_id} with {len(payload.pair_list)} pairs.")
    # results = predict_result_by_image(payload)
    results = detect_elements(payload)

    return {
        "status": "success",
        "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
        "results": results
    }


@router.post("/CaptureByUrl")
async def get_predict_result(payload: PredictRequestByUrl):
    # results = capture(payload)

    try:
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
    results = compare_screenshots_rule_based(payload)
    return {
        "status": "success",
        "message": "Rule-based UI comparison finished.",
        "results": results,
    }


# @router.post("/GetPredictResult")
# async def get_predict_result(payload: PredictRequest):
#     results = detect_elements(payload)

#     return {
#         "status": "success",
#         "message": f"Received {len(payload.pair_list)} screenshots for prediction.",
#         "results": results
#     }
