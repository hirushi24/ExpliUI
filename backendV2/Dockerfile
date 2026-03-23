# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# libgl1-mesa-glx and libglib2.0-0 are for OpenCV
# tesseract-ocr is for OCR
# chromium and chromium-driver are for Selenium
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    chromium \
    chromium-driver \
    libnss3 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Upgrade pip to ensure the latest resolver and better memory management
RUN pip install --no-cache-dir --upgrade pip

# Install CPU-only versions of torch and torchvision first
# This drastically reduces the image size (~2GB -> ~500MB) and RAM usage during install
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy the requirements file into the container
COPY requirements.txt .

# Install the remaining packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Using FastAPI CLI or uvicorn
CMD ["fastapi", "run", "app/main.py", "--port", "8000", "--host", "0.0.0.0"]
