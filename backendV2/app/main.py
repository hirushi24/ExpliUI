import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers.predict import router as predict_router
from fastapi.middleware.cors import CORSMiddleware

# FastAPI entrypoint that configures static file serving, CORS, and prediction routes.
app = FastAPI(title="ExpliUI")

UPLOAD_DIR = "upload_image"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Frontend dev servers are explicitly allowed so local uploads and previews can call the API.
origins = [
    "http://localhost:3000",    # Common React port
    "http://localhost:5173",
    "http://127.0.0.1:5173",   # Common Vite/Vue port
    "http://127.0.0.1:3000",
    # Add production domain here later
]
app.mount("/static", StaticFiles(directory="upload_image"), name="static")
# CORS is restricted to the known frontend origins instead of allowing every site.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Allow specific origins (or ["*"] for all)
    allow_credentials=True,
    allow_methods=["*"],               # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],               # Allow all headers
)
# Mount the prediction router under `/api` to match the frontend axios base URL.
app.include_router(predict_router, prefix="/api")



@app.get("/")   
async def root():
    return {"message": "API is online"}
