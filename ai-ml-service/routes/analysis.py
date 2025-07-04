from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import io
from PIL import Image
import cv2
import numpy as np
import pytesseract
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create APIRouter instance
router = APIRouter()

# Uploads directory
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are supported")

        # Save uploaded file
        filename = file.filename
        file_location = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        logger.info(f"Received file: {filename}, document_type: {document_type}")

        # Load and analyze image
        image = cv2.imread(file_location)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Perform comprehensive document analysis
        analysis_result = perform_document_analysis(image, document_type, filename)

        # Clean up uploaded file
        try:
            os.remove(file_location)
        except:
            pass

        logger.info(f"Analysis Result - Valid: {analysis_result['is_valid']}, Confidence: {analysis_result['confidence_score']}")

        return JSONResponse({
            "is_valid": analysis_result["is_valid"],
            "confidence_score": analysis_result["confidence_score"],
            "detected_text": analysis_result["detected_text"],
            "extracted_data": analysis_result["extracted_data"],
            "anomalies": analysis_result["anomalies"],
            "processing_time": analysis_result["processing_time"],
            "ocr_accuracy": analysis_result["ocr_accuracy"],
            "signature_detected": analysis_result["signature_detected"],
            "format_validation": analysis_result["format_validation"],
            "quality_score": analysis_result["quality_score"],
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

def perform_document_analysis(image, document_type, filename):
    """
    Perform comprehensive document analysis with fake detection
    """
    start_time = datetime.now()
    
    analysis_result = {
        "is_valid": False,
        "confidence_score": 0.0,
        "detected_text": "",
        "extracted_data": {},
        "anomalies": [],
        "processing_time": 0.0,
        "ocr_accuracy": 0.0,
        "signature_detected": False,
        "format_validation": {},
        "quality_score": 0.0
    }
    
    try:
        # 1. Image Quality Analysis
        quality_score = analyze_image_quality(image)
        analysis_result["quality_score"] = quality_score
        
        # 2. OCR Analysis
        ocr_result = perform_ocr_analysis(image)
        analysis_result["detected_text"] = ocr_result["text"]
        analysis_result["ocr_accuracy"] = ocr_result["accuracy"]
        
        # 3. Signature Detection
        signature_detected = detect_signature_presence(image)
        analysis_result["signature_detected"] = signature_detected
        
        # 4. Format Validation
        format_validation = validate_document_format(image, document_type)
        analysis_result["format_validation"] = format_validation
        
        # 5. Anomaly Detection
        anomalies = detect_anomalies(image, ocr_result["text"], filename)
        analysis_result["anomalies"] = anomalies
        
        # 6. Calculate final confidence score
        confidence_score = calculate_confidence_score(
            quality_score, 
            ocr_result["accuracy"], 
            signature_detected, 
            format_validation,
            len(anomalies)
        )
        
        analysis_result["confidence_score"] = confidence_score
        analysis_result["is_valid"] = confidence_score > 0.6 and len(anomalies) == 0
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        analysis_result["processing_time"] = processing_time
        
    except Exception as e:
        logger.error(f"Error in document analysis: {str(e)}")
        analysis_result["anomalies"].append(f"Analysis error: {str(e)}")
    
    return analysis_result

def analyze_image_quality(image):
    """
    Analyze image quality metrics
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Calculate sharpness using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness_score = min(laplacian_var / 1000, 1.0)
        
        # Calculate brightness
        brightness = np.mean(gray) / 255.0
        brightness_score = 1.0 - abs(brightness - 0.5) * 2
        
        # Calculate contrast
        contrast = np.std(gray) / 255.0
        contrast_score = min(contrast * 4, 1.0)
        
        # Overall quality score
        quality_score = (sharpness_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3)
        
        return quality_score
        
    except Exception as e:
        logger.error(f"Quality analysis error: {str(e)}")
        return 0.0

def perform_ocr_analysis(image):
    """
    Perform OCR and analyze text quality
    """
    try:
        # Convert to grayscale for better OCR
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply preprocessing for better OCR
        # Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Perform OCR
        text = pytesseract.image_to_string(thresh)
        
        # Calculate OCR accuracy based on text characteristics
        accuracy = calculate_ocr_accuracy(text)
        
        return {
            "text": text.strip(),
            "accuracy": accuracy
        }
        
    except Exception as e:
        logger.error(f"OCR analysis error: {str(e)}")
        return {
            "text": "",
            "accuracy": 0.0
        }

def calculate_ocr_accuracy(text):
    """
    Calculate OCR accuracy based on text characteristics
    """
    if not text or len(text.strip()) == 0:
        return 0.0
    
    # Basic accuracy metrics
    total_chars = len(text)
    alpha_chars = sum(1 for c in text if c.isalpha())
    digit_chars = sum(1 for c in text if c.isdigit())
    space_chars = sum(1 for c in text if c.isspace())
    
    # Calculate ratio of meaningful characters
    meaningful_chars = alpha_chars + digit_chars + space_chars
    if total_chars == 0:
        return 0.0
    
    accuracy = meaningful_chars / total_chars
    return min(accuracy, 1.0)

def detect_signature_presence(image):
    """
    Basic signature detection using contour analysis
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Look for signature-like contours (curved, continuous lines)
        signature_contours = 0
        for contour in contours:
            area = cv2.contourArea(contour)
            if 100 < area < 10000:  # Signature-like area
                signature_contours += 1
        
        return signature_contours > 0
        
    except Exception as e:
        logger.error(f"Signature detection error: {str(e)}")
        return False

def validate_document_format(image, document_type):
    """
    Validate document format based on type
    """
    try:
        height, width = image.shape[:2]
        aspect_ratio = width / height
        
        format_validation = {
            "dimensions_valid": False,
            "aspect_ratio_valid": False,
            "size_score": 0.0
        }
        
        # Basic dimension validation
        if width >= 600 and height >= 400:
            format_validation["dimensions_valid"] = True
            format_validation["size_score"] = min((width * height) / (1200 * 800), 1.0)
        
        # Aspect ratio validation based on document type
        expected_ratios = {
            "passport": (1.3, 1.5),
            "id-card": (1.5, 1.7),
            "driver-license": (1.5, 1.8),
            "certificate": (1.2, 1.4)
        }
        
        if document_type in expected_ratios:
            min_ratio, max_ratio = expected_ratios[document_type]
            format_validation["aspect_ratio_valid"] = min_ratio <= aspect_ratio <= max_ratio
        else:
            format_validation["aspect_ratio_valid"] = True  # Unknown type, assume valid
        
        return format_validation
        
    except Exception as e:
        logger.error(f"Format validation error: {str(e)}")
        return {"dimensions_valid": False, "aspect_ratio_valid": False, "size_score": 0.0}

def detect_anomalies(image, ocr_text, filename):
    """
    Detect anomalies that might indicate fake documents
    """
    anomalies = []
    
    try:
        # 1. Check for suspicious filenames
        suspicious_words = ["fake", "fraud", "counterfeit", "forged", "sample", "test", "dummy", "specimen"]
        if any(word in filename.lower() for word in suspicious_words):
            anomalies.append("Suspicious filename detected")
        
        # 2. Check for very low image quality
        quality_score = analyze_image_quality(image)
        if quality_score < 0.3:
            anomalies.append("Very low image quality detected")
        
        # 3. Check for suspicious OCR text
        if ocr_text:
            suspicious_text = ["sample", "specimen", "not valid", "copy", "template", "fake", "test"]
            if any(word in ocr_text.lower() for word in suspicious_text):
                anomalies.append("Suspicious text content detected")
        
        # 4. Check for unusual dimensions
        height, width = image.shape[:2]
        if width < 400 or height < 300:
            anomalies.append("Document dimensions too small")
        
        # 5. Check for digital artifacts (simple check)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        if edge_density > 0.3:  # Too many edges might indicate digital manipulation
            anomalies.append("High edge density detected (possible digital manipulation)")
        
        # 6. Check for perfect uniformity (possible digital creation)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        if np.max(hist) / np.sum(hist) > 0.8:  # Too uniform
            anomalies.append("Unusual color distribution detected")
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        anomalies.append(f"Anomaly detection failed: {str(e)}")
    
    return anomalies

def calculate_confidence_score(quality_score, ocr_accuracy, signature_detected, format_validation, anomaly_count):
    """
    Calculate overall confidence score
    """
    # Base score from quality and OCR
    base_score = (quality_score * 0.4 + ocr_accuracy * 0.3)
    
    # Format validation bonus
    format_bonus = 0.0
    if format_validation.get("dimensions_valid", False):
        format_bonus += 0.1
    if format_validation.get("aspect_ratio_valid", False):
        format_bonus += 0.1
    
    # Signature detection bonus
    signature_bonus = 0.1 if signature_detected else 0.0
    
    # Anomaly penalty - critical for fake detection
    anomaly_penalty = anomaly_count * 0.3  # Increased penalty for anomalies
    
    # Calculate final score
    final_score = base_score + format_bonus + signature_bonus - anomaly_penalty
    
    return max(0.0, min(1.0, final_score))
