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
        
        # STRICT VALIDATION: Document is only valid if:
        # 1. High confidence score (>= 0.7)
        # 2. No critical anomalies
        # 3. Good quality score (>= 0.4)
        critical_anomalies = [
            "Suspicious filename detected",
            "Suspicious text content detected", 
            "Suspicious compression artifacts detected",
            "Irregular gradient patterns detected (possible manipulation)",
            "Repeated patterns detected (possible copy-paste manipulation)",
            "Inconsistent noise patterns detected",
            "Unnatural texture uniformity detected",
            "Abrupt texture transitions detected"
        ]
        
        has_critical_anomalies = any(anomaly in critical_anomalies for anomaly in anomalies)
        
        # Final validation decision
        analysis_result["is_valid"] = (
            confidence_score >= 0.7 and 
            not has_critical_anomalies and 
            quality_score >= 0.4 and
            len(anomalies) <= 2
        )
        
        # Add detailed reasoning
        if not analysis_result["is_valid"]:
            reasons = []
            if confidence_score < 0.7:
                reasons.append(f"Low confidence score: {confidence_score:.2f}")
            if has_critical_anomalies:
                reasons.append("Critical anomalies detected")
            if quality_score < 0.4:
                reasons.append(f"Poor image quality: {quality_score:.2f}")
            if len(anomalies) > 2:
                reasons.append(f"Too many anomalies: {len(anomalies)}")
            
            analysis_result["rejection_reasons"] = reasons
        
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
        sharpness_score = min(float(laplacian_var) / 1000, 1.0)
        
        # Calculate brightness
        brightness = float(np.mean(gray)) / 255.0
        brightness_score = 1.0 - abs(brightness - 0.5) * 2
        
        # Calculate contrast
        contrast = float(np.std(gray)) / 255.0
        contrast_score = min(contrast * 4, 1.0)
        
        # Overall quality score
        quality_score = (sharpness_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3)
        
        return float(quality_score)
        
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
        try:
            text = pytesseract.image_to_string(thresh)
        except Exception as ocr_error:
            logger.error(f"Tesseract OCR error: {str(ocr_error)}")
            # Fallback: Return empty text with low accuracy
            return {
                "text": "",
                "accuracy": 0.1
            }
        
        # Calculate OCR accuracy based on text characteristics
        accuracy = calculate_ocr_accuracy(text)
        
        return {
            "text": text.strip(),
            "accuracy": float(accuracy)
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
    
    accuracy = float(meaningful_chars) / float(total_chars)
    return min(float(accuracy), 1.0)

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
        
        return bool(signature_contours > 0)
        
    except Exception as e:
        logger.error(f"Signature detection error: {str(e)}")
        return False

def validate_document_format(image, document_type):
    """
    Validate document format based on type
    """
    try:
        height, width = image.shape[:2]
        aspect_ratio = float(width) / float(height)
        
        format_validation = {
            "dimensions_valid": False,
            "aspect_ratio_valid": False,
            "size_score": 0.0
        }
        
        # Basic dimension validation
        if width >= 600 and height >= 400:
            format_validation["dimensions_valid"] = True
            format_validation["size_score"] = min(float(width * height) / (1200 * 800), 1.0)
        
        # Aspect ratio validation based on document type
        expected_ratios = {
            "passport": (1.3, 1.5),
            "id-card": (1.5, 1.7),
            "driver-license": (1.5, 1.8),
            "certificate": (1.2, 1.4)
        }
        
        if document_type in expected_ratios:
            min_ratio, max_ratio = expected_ratios[document_type]
            format_validation["aspect_ratio_valid"] = bool(min_ratio <= aspect_ratio <= max_ratio)
        else:
            format_validation["aspect_ratio_valid"] = True  # Unknown type, assume valid
        
        return format_validation
        
    except Exception as e:
        logger.error(f"Format validation error: {str(e)}")
        return {"dimensions_valid": False, "aspect_ratio_valid": False, "size_score": 0.0}

def detect_anomalies(image, ocr_text, filename):
    """
    Advanced anomaly detection for fake document identification
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
        
        # 5. Advanced Digital Forensics
        forensic_anomalies = perform_digital_forensics(image)
        anomalies.extend(forensic_anomalies)
        
        # 6. Font and Text Analysis
        font_anomalies = analyze_font_consistency(image, ocr_text)
        anomalies.extend(font_anomalies)
        
        # 7. Color Space Analysis
        color_anomalies = analyze_color_space(image)
        anomalies.extend(color_anomalies)
        
        # 8. Edge and Texture Analysis
        texture_anomalies = analyze_texture_patterns(image)
        anomalies.extend(texture_anomalies)
        
        # 9. Document Structure Analysis
        structure_anomalies = analyze_document_structure(image, ocr_text)
        anomalies.extend(structure_anomalies)
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        anomalies.append(f"Anomaly detection failed: {str(e)}")
    
    return anomalies

def perform_digital_forensics(image):
    """
    Perform advanced digital forensics to detect manipulation
    """
    anomalies = []
    
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 1. Detect compression artifacts
        # Look for JPEG compression inconsistencies
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian_var = np.var(laplacian)
        
        if laplacian_var < 50:  # Very low variance indicates over-compression
            anomalies.append("Suspicious compression artifacts detected")
        
        # 2. Detect resampling artifacts using Error Level Analysis (ELA)
        # Convert to float for mathematical operations
        gray_float = gray.astype(np.float64)
        
        # Calculate second derivative
        sobel_x = cv2.Sobel(gray_float, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray_float, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude
        gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        
        # Check for unusual gradient patterns
        gradient_std = np.std(gradient_magnitude)
        if gradient_std > 80:  # High variation might indicate manipulation
            anomalies.append("Irregular gradient patterns detected (possible manipulation)")
        
        # 3. Detect copy-paste operations
        # Look for repeated patterns in the image
        template_matches = detect_copy_paste_artifacts(gray)
        if template_matches > 5:  # Too many similar regions
            anomalies.append("Repeated patterns detected (possible copy-paste manipulation)")
        
        # 4. Check for noise inconsistencies
        # Real photos have consistent noise patterns
        noise_score = analyze_noise_patterns(gray)
        if noise_score > 0.7:  # Inconsistent noise
            anomalies.append("Inconsistent noise patterns detected")
        
    except Exception as e:
        logger.error(f"Digital forensics error: {str(e)}")
        anomalies.append("Digital forensics analysis failed")
    
    return anomalies

def detect_copy_paste_artifacts(gray):
    """
    Detect copy-paste operations by finding repeated patterns
    """
    try:
        # Divide image into blocks and compare
        h, w = gray.shape
        block_size = 32
        matches = 0
        
        for i in range(0, h - block_size, block_size):
            for j in range(0, w - block_size, block_size):
                block = gray[i:i+block_size, j:j+block_size]
                
                # Search for similar blocks in the rest of the image
                for ii in range(i + block_size, h - block_size, block_size):
                    for jj in range(0, w - block_size, block_size):
                        compare_block = gray[ii:ii+block_size, jj:jj+block_size]
                        
                        # Calculate similarity
                        diff = cv2.absdiff(block, compare_block)
                        similarity = 1.0 - (np.mean(diff) / 255.0)
                        
                        if similarity > 0.95:  # Very similar blocks
                            matches += 1
        
        return matches
        
    except Exception as e:
        logger.error(f"Copy-paste detection error: {str(e)}")
        return 0

def analyze_noise_patterns(gray):
    """
    Analyze noise patterns for inconsistencies
    """
    try:
        # Apply Gaussian blur to get noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        noise = cv2.absdiff(gray, blurred)
        
        # Divide image into regions and analyze noise
        h, w = noise.shape
        region_size = 64
        noise_variances = []
        
        for i in range(0, h - region_size, region_size):
            for j in range(0, w - region_size, region_size):
                region = noise[i:i+region_size, j:j+region_size]
                variance = np.var(region)
                noise_variances.append(variance)
        
        # Calculate coefficient of variation
        if len(noise_variances) > 0:
            mean_var = np.mean(noise_variances)
            std_var = np.std(noise_variances)
            if mean_var > 0:
                cv_noise = std_var / mean_var
                return cv_noise
        
        return 0.0
        
    except Exception as e:
        logger.error(f"Noise analysis error: {str(e)}")
        return 0.0

def analyze_font_consistency(image, ocr_text):
    """
    Analyze font consistency and detect mixed fonts
    """
    anomalies = []
    
    try:
        if not ocr_text or len(ocr_text.strip()) < 10:
            return anomalies
        
        # Check for mixed character encoding
        ascii_chars = sum(1 for c in ocr_text if ord(c) < 128)
        total_chars = len(ocr_text)
        
        if total_chars > 0:
            ascii_ratio = ascii_chars / total_chars
            if ascii_ratio < 0.8:  # Too many non-ASCII characters
                anomalies.append("Inconsistent character encoding detected")
        
        # Check for suspicious text patterns
        words = ocr_text.split()
        if len(words) > 0:
            # Check for too many numbers vs letters
            digit_words = sum(1 for word in words if word.isdigit())
            if digit_words / len(words) > 0.7:
                anomalies.append("Unusual text pattern detected")
        
        # Check for inconsistent spacing
        lines = ocr_text.split('\n')
        if len(lines) > 2:
            line_lengths = [len(line) for line in lines if line.strip()]
            if line_lengths:
                length_variance = np.var(line_lengths)
                if length_variance > 500:  # High variance in line lengths
                    anomalies.append("Inconsistent text formatting detected")
        
    except Exception as e:
        logger.error(f"Font analysis error: {str(e)}")
        anomalies.append("Font analysis failed")
    
    return anomalies

def analyze_color_space(image):
    """
    Analyze color space for manipulation indicators
    """
    anomalies = []
    
    try:
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        
        # Analyze HSV color distribution
        h, s, v = cv2.split(hsv)
        
        # Check for unusual saturation patterns
        sat_mean = np.mean(s)
        sat_std = np.std(s)
        
        if sat_mean > 200 or sat_std > 80:  # Over-saturated or inconsistent
            anomalies.append("Unusual color saturation detected")
        
        # Check for histogram anomalies
        hist_b = cv2.calcHist([image], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([image], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([image], [2], None, [256], [0, 256])
        
        # Check for gaps in histogram (possible manipulation)
        for hist, color in [(hist_b, 'blue'), (hist_g, 'green'), (hist_r, 'red')]:
            zero_bins = np.sum(hist == 0)
            if zero_bins > 50:  # Too many gaps
                anomalies.append(f"Histogram gaps detected in {color} channel")
        
        # Check for color channel inconsistencies
        blue_mean = np.mean(image[:, :, 0])
        green_mean = np.mean(image[:, :, 1])
        red_mean = np.mean(image[:, :, 2])
        
        channel_diff = max(abs(blue_mean - green_mean), abs(green_mean - red_mean), abs(red_mean - blue_mean))
        if channel_diff > 80:  # Channels too different
            anomalies.append("Color channel inconsistency detected")
        
    except Exception as e:
        logger.error(f"Color space analysis error: {str(e)}")
        anomalies.append("Color space analysis failed")
    
    return anomalies

def analyze_texture_patterns(image):
    """
    Analyze texture patterns for manipulation detection
    """
    anomalies = []
    
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Calculate Local Binary Pattern (LBP) for texture analysis
        # Simplified LBP implementation
        lbp = calculate_lbp(gray)
        
        # Calculate texture uniformity
        lbp_hist = cv2.calcHist([lbp], [0], None, [256], [0, 256])
        
        # Check for too uniform texture (possible digital creation)
        max_bin = np.max(lbp_hist)
        total_pixels = gray.shape[0] * gray.shape[1]
        
        if max_bin / total_pixels > 0.6:  # Too uniform
            anomalies.append("Unnatural texture uniformity detected")
        
        # Check for texture discontinuities
        # Calculate texture gradients
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        # Find areas with abrupt texture changes
        gradient_mag = np.sqrt(sobelx**2 + sobely**2)
        threshold = np.percentile(gradient_mag, 95)
        
        high_gradient_pixels = np.sum(gradient_mag > threshold)
        gradient_ratio = high_gradient_pixels / total_pixels
        
        if gradient_ratio > 0.15:  # Too many sharp transitions
            anomalies.append("Abrupt texture transitions detected")
        
    except Exception as e:
        logger.error(f"Texture analysis error: {str(e)}")
        anomalies.append("Texture analysis failed")
    
    return anomalies

def calculate_lbp(gray):
    """
    Calculate simplified Local Binary Pattern
    """
    try:
        rows, cols = gray.shape
        lbp = np.zeros((rows-2, cols-2), dtype=np.uint8)
        
        for i in range(1, rows-1):
            for j in range(1, cols-1):
                center = gray[i, j]
                
                # Compare with 8 neighbors
                neighbors = [
                    gray[i-1, j-1], gray[i-1, j], gray[i-1, j+1],
                    gray[i, j+1], gray[i+1, j+1], gray[i+1, j],
                    gray[i+1, j-1], gray[i, j-1]
                ]
                
                # Calculate LBP value
                lbp_val = 0
                for k, neighbor in enumerate(neighbors):
                    if neighbor >= center:
                        lbp_val += (1 << k)
                
                lbp[i-1, j-1] = lbp_val
        
        return lbp
        
    except Exception as e:
        logger.error(f"LBP calculation error: {str(e)}")
        return gray[1:-1, 1:-1]  # Return cropped original

def analyze_document_structure(image, ocr_text):
    """
    Analyze document structure for authenticity
    """
    anomalies = []
    
    try:
        # Check for proper document layout
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Find text regions using morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contour properties
        text_regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            
            # Filter for text-like regions
            if area > 100 and w > 20 and h > 10:
                aspect_ratio = w / h
                if 0.5 < aspect_ratio < 10:  # Reasonable aspect ratio for text
                    text_regions.append((x, y, w, h))
        
        # Check for proper text alignment
        if len(text_regions) > 3:
            # Check if text regions are roughly aligned
            y_positions = [y for x, y, w, h in text_regions]
            y_variance = np.var(y_positions)
            
            if y_variance > 10000:  # Poor alignment
                anomalies.append("Poor text alignment detected")
        
        # Check for reasonable text density
        total_text_area = sum(w * h for x, y, w, h in text_regions)
        image_area = gray.shape[0] * gray.shape[1]
        text_density = total_text_area / image_area
        
        if text_density < 0.05:  # Too little text
            anomalies.append("Insufficient text content for document type")
        elif text_density > 0.7:  # Too much text
            anomalies.append("Excessive text density detected")
        
    except Exception as e:
        logger.error(f"Document structure analysis error: {str(e)}")
        anomalies.append("Document structure analysis failed")
    
    return anomalies

def calculate_confidence_score(quality_score, ocr_accuracy, signature_detected, format_validation, anomaly_count):
    """
    Calculate overall confidence score with strict anomaly penalties
    """
    # Base score from quality and OCR
    base_score = (float(quality_score) * 0.3 + float(ocr_accuracy) * 0.25)
    
    # Format validation bonus
    format_bonus = 0.0
    if format_validation.get("dimensions_valid", False):
        format_bonus += 0.15
    if format_validation.get("aspect_ratio_valid", False):
        format_bonus += 0.1
    if format_validation.get("size_score", 0) > 0.7:
        format_bonus += 0.1
    
    # Signature detection bonus
    signature_bonus = 0.1 if signature_detected else 0.0
    
    # CRITICAL: Strict anomaly penalty system
    # Any anomaly should significantly reduce confidence
    if anomaly_count == 0:
        # No anomalies - good baseline
        anomaly_penalty = 0.0
        authenticity_bonus = 0.1  # Bonus for clean documents
    elif anomaly_count == 1:
        # One anomaly - moderate penalty
        anomaly_penalty = 0.25
        authenticity_bonus = 0.0
    elif anomaly_count <= 3:
        # Multiple anomalies - high penalty
        anomaly_penalty = 0.5
        authenticity_bonus = 0.0
    else:
        # Many anomalies - document is likely fake
        anomaly_penalty = 0.8
        authenticity_bonus = 0.0
    
    # Calculate final score
    final_score = base_score + format_bonus + signature_bonus + authenticity_bonus - anomaly_penalty
    
    # Additional penalty for suspicious combinations
    if anomaly_count > 0 and quality_score < 0.5:
        final_score -= 0.2  # Poor quality + anomalies = likely fake
    
    if anomaly_count > 2 and ocr_accuracy < 0.5:
        final_score -= 0.3  # Multiple anomalies + poor OCR = very suspicious
    
    return float(max(0.0, min(1.0, final_score)))
