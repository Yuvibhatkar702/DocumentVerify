"""
Simplified Advanced Document Verifier using basic libraries
"""

import cv2
import numpy as np
import os
import json
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime
import pytesseract
from PIL import Image, ExifTags
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleAdvancedVerifier:
    """
    Simplified Advanced Document Verification System
    """
    
    def __init__(self):
        self.suspicious_keywords = ['fake', 'fraud', 'sample', 'test', 'dummy', 'specimen', 'copy', 'not valid', 'template']
        self.editing_software = ['photoshop', 'gimp', 'paint.net', 'canva', 'pixlr', 'photoscape', 'snapseed']
    
    def extract_comprehensive_features(self, image_path: str, document_type: str = "id-card") -> Dict[str, Any]:
        """
        Extract comprehensive features using basic libraries
        """
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            features = {
                'image_path': image_path,
                'document_type': document_type,
                'timestamp': datetime.now().isoformat()
            }
            
            # 1. Basic Image Properties
            features.update(self.extract_basic_features(image, gray))
            
            # 2. OCR Features
            features.update(self.extract_ocr_features(image, gray))
            
            # 3. Digital Forensics Features
            features.update(self.extract_forensics_features(image, gray))
            
            # 4. Metadata Features
            features.update(self.extract_metadata_features(image_path))
            
            # 5. Content Analysis
            features.update(self.extract_content_features(image, gray, document_type))
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return {'error': str(e)}
    
    def extract_basic_features(self, image: np.ndarray, gray: np.ndarray) -> Dict[str, Any]:
        """Extract basic image features"""
        try:
            features = {}
            
            # Image dimensions
            features['image_width'] = image.shape[1]
            features['image_height'] = image.shape[0]
            features['aspect_ratio'] = image.shape[1] / image.shape[0]
            
            # Image quality metrics
            features['sharpness'] = cv2.Laplacian(gray, cv2.CV_64F).var()
            features['brightness'] = np.mean(gray)
            features['contrast'] = np.std(gray)
            
            # Edge analysis
            edges = cv2.Canny(gray, 50, 150)
            features['edge_density'] = np.sum(edges > 0) / edges.size
            
            # Histogram analysis
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            features['hist_entropy'] = -np.sum((hist + 1e-10) * np.log2(hist + 1e-10))
            features['hist_peak'] = np.max(hist)
            features['hist_uniformity'] = np.sum(hist ** 2)
            
            return features
            
        except Exception as e:
            logger.error(f"Basic feature extraction error: {e}")
            return {
                'image_width': 0, 'image_height': 0, 'aspect_ratio': 0,
                'sharpness': 0, 'brightness': 0, 'contrast': 0,
                'edge_density': 0, 'hist_entropy': 0, 'hist_peak': 0, 'hist_uniformity': 0
            }
    
    def extract_ocr_features(self, image: np.ndarray, gray: np.ndarray) -> Dict[str, Any]:
        """Extract OCR-based features"""
        try:
            features = {}
            
            # Perform OCR
            try:
                text = pytesseract.image_to_string(gray)
                data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
            except Exception as ocr_error:
                logger.warning(f"OCR error: {ocr_error}")
                text = ""
                data = {'conf': [0]}
            
            # Text statistics
            features['ocr_text_length'] = len(text)
            features['ocr_word_count'] = len(text.split())
            
            # OCR confidence
            confidences = [conf for conf in data['conf'] if conf > 0]
            features['ocr_confidence_mean'] = np.mean(confidences) if confidences else 0
            features['ocr_confidence_std'] = np.std(confidences) if confidences else 0
            
            # Character analysis
            alpha_chars = sum(1 for c in text if c.isalpha())
            digit_chars = sum(1 for c in text if c.isdigit())
            special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
            
            total_chars = len(text)
            if total_chars > 0:
                features['alpha_ratio'] = alpha_chars / total_chars
                features['digit_ratio'] = digit_chars / total_chars
                features['special_ratio'] = special_chars / total_chars
            else:
                features['alpha_ratio'] = 0
                features['digit_ratio'] = 0
                features['special_ratio'] = 0
            
            # Suspicious text detection
            text_lower = text.lower()
            features['suspicious_text_detected'] = any(keyword in text_lower for keyword in self.suspicious_keywords)
            
            # Store extracted text
            features['extracted_text'] = text[:500]
            
            return features
            
        except Exception as e:
            logger.error(f"OCR feature extraction error: {e}")
            return {
                'ocr_text_length': 0, 'ocr_word_count': 0,
                'ocr_confidence_mean': 0, 'ocr_confidence_std': 0,
                'alpha_ratio': 0, 'digit_ratio': 0, 'special_ratio': 0,
                'suspicious_text_detected': False, 'extracted_text': ''
            }
    
    def extract_forensics_features(self, image: np.ndarray, gray: np.ndarray) -> Dict[str, Any]:
        """Extract digital forensics features"""
        try:
            features = {}
            
            # Noise analysis
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            noise = gray.astype(np.float32) - blurred.astype(np.float32)
            features['noise_level'] = np.std(noise)
            
            # Gradient analysis
            gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            gradient_magnitude = np.sqrt(gx**2 + gy**2)
            features['gradient_mean'] = np.mean(gradient_magnitude)
            features['gradient_std'] = np.std(gradient_magnitude)
            
            # Copy-paste detection (simplified)
            features['copy_paste_score'] = self.detect_copy_paste(gray)
            
            # Color analysis
            if len(image.shape) == 3:
                # Check for color channel inconsistencies
                b_mean, g_mean, r_mean = np.mean(image, axis=(0, 1))
                channel_diff = max(abs(b_mean - g_mean), abs(g_mean - r_mean), abs(r_mean - b_mean))
                features['color_channel_diff'] = channel_diff
                
                # Saturation analysis
                hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
                saturation = hsv[:, :, 1]
                features['saturation_mean'] = np.mean(saturation)
                features['saturation_std'] = np.std(saturation)
            else:
                features['color_channel_diff'] = 0
                features['saturation_mean'] = 0
                features['saturation_std'] = 0
            
            # Compression artifacts
            # Look for blocking artifacts
            h, w = gray.shape
            block_scores = []
            for i in range(0, h-8, 8):
                for j in range(0, w-8, 8):
                    block = gray[i:i+8, j:j+8]
                    block_var = np.var(block)
                    block_scores.append(block_var)
            
            features['block_variance_mean'] = np.mean(block_scores) if block_scores else 0
            features['block_variance_std'] = np.std(block_scores) if block_scores else 0
            
            return features
            
        except Exception as e:
            logger.error(f"Forensics feature extraction error: {e}")
            return {
                'noise_level': 0, 'gradient_mean': 0, 'gradient_std': 0,
                'copy_paste_score': 0, 'color_channel_diff': 0,
                'saturation_mean': 0, 'saturation_std': 0,
                'block_variance_mean': 0, 'block_variance_std': 0
            }
    
    def extract_metadata_features(self, image_path: str) -> Dict[str, Any]:
        """Extract metadata features"""
        try:
            features = {}
            
            # File metadata
            file_stats = os.stat(image_path)
            features['file_size'] = file_stats.st_size
            
            # Try to extract EXIF data
            try:
                with Image.open(image_path) as img:
                    exif_data = img._getexif()
                    
                    if exif_data:
                        # Camera and software info
                        camera_make = exif_data.get(271, 'Unknown')  # Make
                        camera_model = exif_data.get(272, 'Unknown')  # Model
                        software = exif_data.get(305, 'Unknown')  # Software
                        
                        features['camera_make'] = str(camera_make)
                        features['camera_model'] = str(camera_model)
                        features['software'] = str(software)
                        
                        # Check for editing software
                        software_lower = str(software).lower()
                        features['editing_software_detected'] = any(sw in software_lower for sw in self.editing_software)
                    else:
                        features['camera_make'] = 'Unknown'
                        features['camera_model'] = 'Unknown'
                        features['software'] = 'Unknown'
                        features['editing_software_detected'] = False
                        
            except Exception as exif_error:
                logger.warning(f"EXIF extraction error: {exif_error}")
                features['camera_make'] = 'Unknown'
                features['camera_model'] = 'Unknown'
                features['software'] = 'Unknown'
                features['editing_software_detected'] = False
            
            # Filename analysis
            filename = os.path.basename(image_path).lower()
            features['suspicious_filename'] = any(keyword in filename for keyword in self.suspicious_keywords)
            
            return features
            
        except Exception as e:
            logger.error(f"Metadata feature extraction error: {e}")
            return {
                'file_size': 0, 'camera_make': 'Unknown',
                'camera_model': 'Unknown', 'software': 'Unknown',
                'editing_software_detected': False, 'suspicious_filename': False
            }
    
    def extract_content_features(self, image: np.ndarray, gray: np.ndarray, document_type: str) -> Dict[str, Any]:
        """Extract content-specific features"""
        try:
            features = {}
            
            # Face detection (simplified using contours)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            features['face_count'] = len(faces)
            features['face_detected'] = len(faces) > 0
            features['multiple_faces_detected'] = len(faces) > 1
            
            if len(faces) > 0:
                # Analyze face quality
                face_qualities = []
                for (x, y, w, h) in faces:
                    face_region = gray[y:y+h, x:x+w]
                    if face_region.size > 0:
                        face_sharpness = cv2.Laplacian(face_region, cv2.CV_64F).var()
                        face_qualities.append(face_sharpness)
                
                features['face_quality_mean'] = np.mean(face_qualities) if face_qualities else 0
            else:
                features['face_quality_mean'] = 0
            
            # Logo/seal detection (simplified)
            # Look for circular/rectangular shapes that might be logos
            contours, _ = cv2.findContours(cv2.Canny(gray, 50, 150), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            logo_candidates = 0
            for contour in contours:
                area = cv2.contourArea(contour)
                if 500 < area < 10000:  # Logo-like size
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter ** 2)
                        if circularity > 0.3:  # Somewhat circular
                            logo_candidates += 1
            
            features['logo_candidates_count'] = logo_candidates
            features['logo_detected'] = logo_candidates > 0
            
            # QR code detection (simplified - look for square patterns)
            # This is a very basic approach
            qr_patterns = 0
            kernel = np.ones((5, 5), np.uint8)
            binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)[1]
            
            # Look for square patterns
            squares = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
            for square in squares:
                area = cv2.contourArea(square)
                if 1000 < area < 50000:  # QR code size range
                    x, y, w, h = cv2.boundingRect(square)
                    aspect_ratio = w / h
                    if 0.8 < aspect_ratio < 1.2:  # Square-like
                        qr_patterns += 1
            
            features['qr_code_count'] = qr_patterns
            features['qr_codes_detected'] = qr_patterns > 0
            
            return features
            
        except Exception as e:
            logger.error(f"Content feature extraction error: {e}")
            return {
                'face_count': 0, 'face_detected': False, 'multiple_faces_detected': False,
                'face_quality_mean': 0, 'logo_candidates_count': 0, 'logo_detected': False,
                'qr_code_count': 0, 'qr_codes_detected': False
            }
    
    def detect_copy_paste(self, gray: np.ndarray, block_size: int = 32) -> float:
        """Simplified copy-paste detection"""
        try:
            h, w = gray.shape
            if h < block_size * 2 or w < block_size * 2:
                return 0.0
            
            similarity_scores = []
            sample_count = 0
            max_samples = 10  # Limit samples for performance
            
            for i in range(0, h - block_size, block_size * 2):
                for j in range(0, w - block_size, block_size * 2):
                    if sample_count >= max_samples:
                        break
                    
                    block = gray[i:i+block_size, j:j+block_size]
                    
                    # Compare with one other block
                    compare_i = min(i + block_size * 2, h - block_size)
                    compare_j = min(j + block_size, w - block_size)
                    compare_block = gray[compare_i:compare_i+block_size, compare_j:compare_j+block_size]
                    
                    # Calculate simple correlation
                    if block.size == compare_block.size:
                        correlation = np.corrcoef(block.flatten(), compare_block.flatten())[0, 1]
                        if not np.isnan(correlation):
                            similarity_scores.append(abs(correlation))
                    
                    sample_count += 1
            
            return np.mean(similarity_scores) if similarity_scores else 0.0
            
        except Exception as e:
            logger.error(f"Copy-paste detection error: {e}")
            return 0.0
    
    def classify_document(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify document using rule-based approach
        """
        try:
            score = 0.5  # Start with neutral
            anomalies = []
            
            # Image quality checks
            if features.get('sharpness', 0) > 100:
                score += 0.1
            elif features.get('sharpness', 0) < 20:
                score -= 0.1
                anomalies.append("Very low image sharpness")
            
            if features.get('contrast', 0) > 50:
                score += 0.05
            elif features.get('contrast', 0) < 20:
                score -= 0.1
                anomalies.append("Very low image contrast")
            
            # OCR quality
            ocr_conf = features.get('ocr_confidence_mean', 0)
            if ocr_conf > 80:
                score += 0.1
            elif ocr_conf < 30:
                score -= 0.1
                anomalies.append("Very low OCR confidence")
            
            # Text analysis
            if features.get('suspicious_text_detected', False):
                score -= 0.15 # Reduced penalty
                anomalies.append("Suspicious text content detected")
            
            if features.get('ocr_text_length', 0) < 10:
                score -= 0.1
                anomalies.append("Very little text detected")
            
            # Face detection for ID documents
            doc_type = features.get('document_type', '')
            if doc_type in ['id-card', 'passport', 'driver-license', 'aadhar-card']:
                if features.get('face_detected', False):
                    score += 0.1
                    if features.get('face_quality_mean', 0) > 100: # Assuming face_quality_mean is sharpness-like
                        score += 0.05
                else:
                    score -= 0.15 # Reduced penalty for no face in ID
                    anomalies.append("No face detected in ID document (or detection failed)")
                
                if features.get('multiple_faces_detected', False):
                    score -= 0.15
                    anomalies.append("Multiple faces detected in ID document")
            
            # Metadata checks
            if features.get('editing_software_detected', False):
                score -= 0.05 # Reduced penalty
                anomalies.append("Document may have been processed by editing software") # Softened message
            
            if features.get('suspicious_filename', False):
                score -= 0.10 # Reduced penalty
                anomalies.append("Suspicious filename detected")
            
            # File size check
            if features.get('file_size', 0) < 5000: # Threshold to 5KB, reduced penalty
                score -= 0.05
                anomalies.append("File size is very small")
            
            # Digital forensics
            if features.get('copy_paste_score', 0) > 0.8: # Threshold to 0.8, reduced penalty
                score -= 0.15
                anomalies.append("High copy-paste similarity detected")
            
            # Image dimensions
            width = features.get('image_width', 0)
            height = features.get('image_height', 0)
            if width < 400 or height < 300:
                score -= 0.1
                anomalies.append("Image dimensions too small")
            
            # Apply final constraints
            final_score = max(0.0, min(1.0, score))
            
            # Document is authentic if score > 0.65 and fewer anomalies
            is_authentic = final_score >= 0.65 and len(anomalies) <= 3 # Adjusted threshold and anomaly count
            
            return {
                'is_authentic': is_authentic,
                'confidence': final_score,
                'anomalies': anomalies,
                'classification_method': 'rule_based_advanced',
                'feature_scores': {
                    'image_quality': features.get('sharpness', 0) / 200,
                    'ocr_quality': features.get('ocr_confidence_mean', 0) / 100,
                    'content_validation': 1.0 if not features.get('suspicious_text_detected', False) else 0.0,
                    'metadata_validation': 1.0 if not features.get('editing_software_detected', False) else 0.0
                }
            }
            
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return {
                'is_authentic': False,
                'confidence': 0.1,
                'anomalies': [f"Classification failed: {str(e)}"],
                'classification_method': 'error'
            }

# Global instance
simple_verifier = SimpleAdvancedVerifier()
