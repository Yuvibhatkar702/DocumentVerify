from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import cv2
import numpy as np
from PIL import Image
import io
import pytesseract
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
):
    """
    Comprehensive document analysis combining OCR, signature detection, and validation
    """
    try:
        start_time = datetime.now()
        
        # Validate file type
        if not file.content_type.startswith(('image/', 'application/pdf')):
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Read file content
        content = await file.read()
        
        # Convert to image if needed
        if file.content_type == 'application/pdf':
            # For PDF files, you might want to use pdf2image library
            # This is a simplified implementation
            raise HTTPException(status_code=400, detail="PDF processing not implemented yet")
        
        # Load image
        image = Image.open(io.BytesIO(content))
        img_array = np.array(image)
        
        # Perform comprehensive analysis
        analysis_result = await perform_comprehensive_analysis(img_array, document_type)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        analysis_result["processing_time"] = processing_time
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Document analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def perform_comprehensive_analysis(image, document_type):
    """
    Perform comprehensive document analysis
    """
    result = {
        "is_valid": False,
        "confidence_score": 0.0,
        "detected_text": "",
        "extracted_data": {},
        "anomalies": [],
        "ocr_accuracy": 0.0,
        "signature_detected": False,
        "format_validation": {},
        "quality_score": 0.0
    }
    
    try:
        # 1. Image Quality Assessment
        quality_score = assess_image_quality(image)
        result["quality_score"] = quality_score
        
        if quality_score < 0.3:
            result["anomalies"].append("Poor image quality")
        
        # 2. OCR Processing
        ocr_result = perform_ocr(image)
        result["detected_text"] = ocr_result["text"]
        result["ocr_accuracy"] = ocr_result["confidence"]
        
        # 3. Signature Detection
        signature_detected = detect_signature(image)
        result["signature_detected"] = signature_detected
        
        # 4. Document Type Validation
        format_validation = validate_document_format(image, document_type)
        result["format_validation"] = format_validation
        
        # 5. Extract structured data based on document type
        extracted_data = extract_document_data(ocr_result["text"], document_type)
        result["extracted_data"] = extracted_data
        
        # 6. Calculate overall confidence score
        confidence_score = calculate_confidence_score(
            quality_score, 
            ocr_result["confidence"], 
            signature_detected, 
            format_validation,
            extracted_data
        )
        result["confidence_score"] = confidence_score
        
        # 7. Determine if document is valid
        result["is_valid"] = confidence_score > 0.7 and quality_score > 0.4
        
        # 8. Identify anomalies
        anomalies = identify_anomalies(image, ocr_result, document_type)
        result["anomalies"].extend(anomalies)
        
    except Exception as e:
        logger.error(f"Comprehensive analysis error: {str(e)}")
        result["anomalies"].append(f"Analysis error: {str(e)}")
    
    return result

def assess_image_quality(image):
    """
    Assess image quality using various metrics
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Calculate sharpness using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Normalize sharpness score (0-1)
        sharpness_score = min(laplacian_var / 1000, 1.0)
        
        # Calculate brightness
        brightness = np.mean(gray) / 255.0
        
        # Penalize very dark or very bright images
        brightness_score = 1.0 - abs(brightness - 0.5) * 2
        
        # Calculate contrast
        contrast = np.std(gray) / 255.0
        
        # Combine scores
        quality_score = (sharpness_score * 0.4 + brightness_score * 0.3 + contrast * 0.3)
        
        return quality_score
        
    except Exception as e:
        logger.error(f"Image quality assessment error: {str(e)}")
        return 0.0

def perform_ocr(image):
    """
    Perform OCR on the image
    """
    try:
        # Convert to PIL Image if needed
        if isinstance(image, np.ndarray):
            pil_image = Image.fromarray(image)
        else:
            pil_image = image
        
        # Perform OCR with confidence scores
        data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT)
        
        # Extract text and calculate average confidence
        text_parts = []
        confidences = []
        
        for i, conf in enumerate(data['conf']):
            if conf > 0:  # Valid detection
                text = data['text'][i].strip()
                if text:
                    text_parts.append(text)
                    confidences.append(conf)
        
        full_text = ' '.join(text_parts)
        avg_confidence = np.mean(confidences) / 100.0 if confidences else 0.0
        
        return {
            "text": full_text,
            "confidence": avg_confidence
        }
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        return {"text": "", "confidence": 0.0}

def detect_signature(image):
    """
    Detect signatures in the document
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply threshold to get binary image
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Look for signature-like contours (irregular shapes with specific area)
        signature_found = False
        for contour in contours:
            area = cv2.contourArea(contour)
            if 1000 < area < 50000:  # Typical signature area range
                # Check aspect ratio and solidity
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                hull = cv2.convexHull(contour)
                hull_area = cv2.contourArea(hull)
                solidity = area / hull_area if hull_area > 0 else 0
                
                # Signatures typically have certain characteristics
                if 0.5 < aspect_ratio < 4.0 and 0.3 < solidity < 0.8:
                    signature_found = True
                    break
        
        return signature_found
        
    except Exception as e:
        logger.error(f"Signature detection error: {str(e)}")
        return False

def validate_document_format(image, document_type):
    """
    Validate document format based on type
    """
    validation_result = {
        "format_match": False,
        "expected_elements": [],
        "found_elements": [],
        "format_score": 0.0
    }
    
    try:
        height, width = image.shape[:2]
        aspect_ratio = width / height
        
        # Define expected characteristics for different document types
        format_rules = {
            "passport": {
                "aspect_ratio_range": (1.3, 1.5),
                "min_dimensions": (300, 400),
                "expected_elements": ["Photo", "Text", "Machine Readable Zone"]
            },
            "id-card": {
                "aspect_ratio_range": (1.5, 1.7),
                "min_dimensions": (250, 400),
                "expected_elements": ["Photo", "Text", "ID Number"]
            },
            "driver-license": {
                "aspect_ratio_range": (1.5, 1.8),
                "min_dimensions": (250, 400),
                "expected_elements": ["Photo", "License Number", "Address"]
            },
            "certificate": {
                "aspect_ratio_range": (1.2, 1.4),
                "min_dimensions": (400, 500),
                "expected_elements": ["Title", "Name", "Date", "Signature"]
            }
        }
        
        if document_type in format_rules:
            rules = format_rules[document_type]
            
            # Check aspect ratio
            ar_min, ar_max = rules["aspect_ratio_range"]
            if ar_min <= aspect_ratio <= ar_max:
                validation_result["format_match"] = True
                validation_result["format_score"] += 0.5
            
            # Check dimensions
            min_w, min_h = rules["min_dimensions"]
            if width >= min_w and height >= min_h:
                validation_result["format_score"] += 0.3
            
            validation_result["expected_elements"] = rules["expected_elements"]
            validation_result["found_elements"] = rules["expected_elements"]  # Simplified
            
        return validation_result
        
    except Exception as e:
        logger.error(f"Format validation error: {str(e)}")
        return validation_result

def extract_document_data(text, document_type):
    """
    Extract structured data from OCR text based on document type
    """
    extracted_data = {}
    
    try:
        text_upper = text.upper()
        
        if document_type == "passport":
            # Extract passport-specific data
            if "PASSPORT" in text_upper:
                extracted_data["document_type"] = "passport"
            
            # Look for passport number pattern
            import re
            passport_pattern = r'[A-Z]{1,2}[0-9]{6,9}'
            matches = re.findall(passport_pattern, text_upper)
            if matches:
                extracted_data["passport_number"] = matches[0]
        
        elif document_type == "id-card":
            # Extract ID card specific data
            if "ID" in text_upper or "IDENTITY" in text_upper:
                extracted_data["document_type"] = "id_card"
            
            # Look for ID number pattern
            id_pattern = r'[0-9]{9,12}'
            matches = re.findall(id_pattern, text)
            if matches:
                extracted_data["id_number"] = matches[0]
        
        elif document_type == "driver-license":
            # Extract driver's license specific data
            if "LICENSE" in text_upper or "LICENCE" in text_upper:
                extracted_data["document_type"] = "drivers_license"
            
            # Look for license number
            license_pattern = r'[A-Z0-9]{8,15}'
            matches = re.findall(license_pattern, text_upper)
            if matches:
                extracted_data["license_number"] = matches[0]
        
        # Common extraction for all document types
        # Extract dates
        date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
        dates = re.findall(date_pattern, text)
        if dates:
            extracted_data["dates"] = dates
        
        # Extract names (simplified)
        name_pattern = r'[A-Z][a-z]+ [A-Z][a-z]+'
        names = re.findall(name_pattern, text)
        if names:
            extracted_data["potential_names"] = names[:3]  # Limit to first 3 matches
        
    except Exception as e:
        logger.error(f"Data extraction error: {str(e)}")
    
    return extracted_data

def calculate_confidence_score(quality_score, ocr_confidence, signature_detected, format_validation, extracted_data):
    """
    Calculate overall confidence score
    """
    try:
        # Weight different factors
        weights = {
            "quality": 0.25,
            "ocr": 0.30,
            "signature": 0.15,
            "format": 0.20,
            "data": 0.10
        }
        
        # Calculate weighted score
        score = 0.0
        score += quality_score * weights["quality"]
        score += ocr_confidence * weights["ocr"]
        score += (1.0 if signature_detected else 0.0) * weights["signature"]
        score += format_validation.get("format_score", 0.0) * weights["format"]
        score += (1.0 if extracted_data else 0.0) * weights["data"]
        
        return min(score, 1.0)
        
    except Exception as e:
        logger.error(f"Confidence calculation error: {str(e)}")
        return 0.0

def identify_anomalies(image, ocr_result, document_type):
    """
    Identify potential anomalies or issues
    """
    anomalies = []
    
    try:
        # Check OCR confidence
        if ocr_result["confidence"] < 0.5:
            anomalies.append("Low OCR confidence - text may be unclear")
        
        # Check for very little text
        if len(ocr_result["text"]) < 50:
            anomalies.append("Very little text detected")
        
        # Check image dimensions
        height, width = image.shape[:2]
        if width < 300 or height < 400:
            anomalies.append("Image resolution too low")
        
        # Check for potential tampering indicators
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (width * height)
        
        if edge_density > 0.3:
            anomalies.append("High edge density - possible image manipulation")
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        anomalies.append(f"Anomaly detection failed: {str(e)}")
    
    return anomalies
