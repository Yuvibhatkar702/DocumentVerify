from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import os
import json
from datetime import datetime
import logging
from typing import Optional

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Document Verification AI/ML Service",
    description="AI/ML microservice for document verification and analysis",
    version="1.0.0"
)

# Enable CORS (For frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Allow all for development, change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import route modules
from routes.analysis import router as analysis_router
from routes.ocr import router as ocr_router
from routes.signature import router as signature_router
from routes.validation import router as validation_router

# Register routers with API prefix
app.include_router(analysis_router, prefix="/api/v1")
app.include_router(ocr_router, prefix="/api/v1")
app.include_router(signature_router, prefix="/api/v1")
app.include_router(validation_router, prefix="/api/v1")

# Health Check Route
@app.get("/health")
async def health_check():
    logger.info("Health check called.")
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "ocr": "available",
            "signature_detection": "available",
            "document_analysis": "available"
        }
    }

# Service Info Route
@app.get("/info")
async def service_info():
    logger.info("Service info requested.")
    return {
        "service": "Document Verification AI/ML Service",
        "version": "1.0.0",
        "capabilities": [
            "OCR (Optical Character Recognition)",
            "Signature Detection",
            "Document Format Validation",
            "Image Quality Assessment",
            "Document Type Classification"
        ],
        "supported_formats": ["JPEG", "PNG", "PDF"],
        "max_file_size": "10MB"
    }

# Root Test Route
@app.get("/")
async def root():
    logger.info("Root endpoint accessed.")
    return {
        "message": "Document Verification AI/ML Service is running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# Test OCR-like Text Extraction (Dummy)
@app.post("/extract-text")
async def extract_text_simple(data: dict):
    try:
        text = data.get('text', '')
        logger.info(f"Extracted text: {text}")
        return {
            "success": True,
            "extracted_text": text,
            "confidence": 0.95,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test Document Classification (Dummy)
@app.post("/classify-document")
async def classify_document_simple(data: dict):
    try:
        doc_type = data.get('document_type', 'unknown')
        text_content = data.get('text_content', '')

        confidence = 0.85
        classification = 'unknown_document'

        if 'passport' in text_content.lower():
            classification = 'passport'
            confidence = 0.95
        elif 'driver' in text_content.lower() or 'license' in text_content.lower():
            classification = 'drivers_license'
            confidence = 0.90

        logger.info(f"Document classified as {classification} with confidence {confidence}")

        return {
            "success": True,
            "document_type": classification,
            "confidence": confidence,
            "input_type": doc_type,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Document classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test Document Verification (Dummy)
@app.post("/verify-document")
async def verify_document_simple(data: dict):
    try:
        doc_type = data.get('document_type', 'unknown')
        extracted_data = data.get('extracted_data', {})

        verification_score = 0.85
        issues = []

        if doc_type == 'passport':
            if 'passport_number' not in extracted_data:
                issues.append('Missing passport number')
                verification_score -= 0.2
            if 'name' not in extracted_data:
                issues.append('Missing name')
                verification_score -= 0.1
        elif doc_type == 'drivers_license':
            if 'license_number' not in extracted_data:
                issues.append('Missing license number')
                verification_score -= 0.2

        is_valid = verification_score >= 0.7 and len(issues) == 0

        logger.info(f"Document verification completed for {doc_type}, valid: {is_valid}")

        return {
            "success": True,
            "document_type": doc_type,
            "is_valid": is_valid,
            "verification_score": verification_score,
            "issues": issues,
            "extracted_data": extracted_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Document verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Run with Uvicorn if executed directly
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
