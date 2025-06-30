from fastapi import APIRouter, File, UploadFile, HTTPException
import cv2
import numpy as np
from PIL import Image
import io
import pytesseract
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/ocr")
async def perform_ocr_analysis(file: UploadFile = File(...)):
    """
    Perform OCR (Optical Character Recognition) on uploaded document
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are supported")
        
        # Read file content
        content = await file.read()
        
        # Load image
        image = Image.open(io.BytesIO(content))
        
        # Perform OCR
        ocr_result = extract_text_with_confidence(image)
        
        return {
            "success": True,
            "text": ocr_result["text"],
            "confidence": ocr_result["confidence"],
            "word_count": len(ocr_result["text"].split()),
            "detected_languages": ocr_result.get("languages", []),
            "text_regions": ocr_result.get("regions", [])
        }
        
    except Exception as e:
        logger.error(f"OCR analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

def extract_text_with_confidence(image):
    """
    Extract text from image with confidence scores
    """
    try:
        # Convert PIL to numpy array
        img_array = np.array(image)
        
        # Preprocess image for better OCR results
        preprocessed = preprocess_image_for_ocr(img_array)
        
        # Perform OCR with detailed output
        data = pytesseract.image_to_data(
            preprocessed, 
            output_type=pytesseract.Output.DICT,
            config='--psm 6'  # Assume uniform block of text
        )
        
        # Extract text and confidence
        text_parts = []
        confidences = []
        regions = []
        
        for i in range(len(data['text'])):
            text = data['text'][i].strip()
            conf = data['conf'][i]
            
            if text and conf > 0:
                text_parts.append(text)
                confidences.append(conf)
                
                # Store region information
                regions.append({
                    "text": text,
                    "confidence": conf,
                    "bbox": {
                        "x": data['left'][i],
                        "y": data['top'][i],
                        "width": data['width'][i],
                        "height": data['height'][i]
                    }
                })
        
        full_text = ' '.join(text_parts)
        avg_confidence = np.mean(confidences) / 100.0 if confidences else 0.0
        
        # Detect languages (simplified)
        languages = detect_languages(full_text)
        
        return {
            "text": full_text,
            "confidence": avg_confidence,
            "languages": languages,
            "regions": regions
        }
        
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return {
            "text": "",
            "confidence": 0.0,
            "languages": [],
            "regions": []
        }

def preprocess_image_for_ocr(image):
    """
    Preprocess image to improve OCR accuracy
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Noise removal
        denoised = cv2.medianBlur(gray, 3)
        
        # Thresholding
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations to clean up
        kernel = np.ones((1, 1), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
        
    except Exception as e:
        logger.error(f"Image preprocessing error: {str(e)}")
        return image

def detect_languages(text):
    """
    Detect languages in the text (simplified implementation)
    """
    try:
        # This is a simplified language detection
        # In production, you might want to use langdetect or similar libraries
        
        languages = []
        
        # Check for English
        if any(char.isalpha() and ord(char) < 128 for char in text):
            languages.append("en")
        
        # Check for numbers
        if any(char.isdigit() for char in text):
            languages.append("numeric")
        
        return languages if languages else ["unknown"]
        
    except Exception as e:
        logger.error(f"Language detection error: {str(e)}")
        return ["unknown"]
