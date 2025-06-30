import numpy as np
import cv2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import logging

logger = logging.getLogger(__name__)

def extract_features_from_image(image):
    """
    Extract various features from document image
    """
    features = {}
    
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image
        
        # Basic image features
        features['dimensions'] = {
            'width': image.shape[1],
            'height': image.shape[0],
            'aspect_ratio': image.shape[1] / image.shape[0]
        }
        
        # Texture features
        features['texture'] = extract_texture_features(gray)
        
        # Edge features
        features['edges'] = extract_edge_features(gray)
        
        # Color features (if color image)
        if len(image.shape) == 3:
            features['color'] = extract_color_features(image)
        
        # Contour features
        features['contours'] = extract_contour_features(gray)
        
    except Exception as e:
        logger.error(f"Feature extraction error: {str(e)}")
    
    return features

def extract_texture_features(gray_image):
    """
    Extract texture features using Local Binary Pattern and other methods
    """
    try:
        # Calculate gradient
        grad_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        
        # Gradient magnitude and direction
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Texture statistics
        texture_features = {
            'mean_intensity': np.mean(gray_image),
            'std_intensity': np.std(gray_image),
            'gradient_magnitude_mean': np.mean(magnitude),
            'gradient_magnitude_std': np.std(magnitude),
            'entropy': calculate_entropy(gray_image)
        }
        
        return texture_features
        
    except Exception as e:
        logger.error(f"Texture feature extraction error: {str(e)}")
        return {}

def extract_edge_features(gray_image):
    """
    Extract edge-based features
    """
    try:
        # Canny edge detection
        edges = cv2.Canny(gray_image, 50, 150)
        
        # Edge statistics
        edge_features = {
            'edge_density': np.sum(edges > 0) / (edges.shape[0] * edges.shape[1]),
            'edge_count': np.sum(edges > 0),
            'edge_intensity_mean': np.mean(edges[edges > 0]) if np.any(edges > 0) else 0
        }
        
        return edge_features
        
    except Exception as e:
        logger.error(f"Edge feature extraction error: {str(e)}")
        return {}

def extract_color_features(color_image):
    """
    Extract color-based features
    """
    try:
        # Convert to different color spaces
        hsv = cv2.cvtColor(color_image, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(color_image, cv2.COLOR_RGB2LAB)
        
        # Color statistics for each channel
        color_features = {
            'rgb_mean': [np.mean(color_image[:,:,i]) for i in range(3)],
            'rgb_std': [np.std(color_image[:,:,i]) for i in range(3)],
            'hsv_mean': [np.mean(hsv[:,:,i]) for i in range(3)],
            'hsv_std': [np.std(hsv[:,:,i]) for i in range(3)],
            'lab_mean': [np.mean(lab[:,:,i]) for i in range(3)],
            'lab_std': [np.std(lab[:,:,i]) for i in range(3)]
        }
        
        return color_features
        
    except Exception as e:
        logger.error(f"Color feature extraction error: {str(e)}")
        return {}

def extract_contour_features(gray_image):
    """
    Extract contour-based features
    """
    try:
        # Find contours
        _, binary = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return {'contour_count': 0}
        
        # Calculate contour statistics
        areas = [cv2.contourArea(c) for c in contours]
        perimeters = [cv2.arcLength(c, True) for c in contours]
        
        contour_features = {
            'contour_count': len(contours),
            'total_area': sum(areas),
            'mean_area': np.mean(areas) if areas else 0,
            'std_area': np.std(areas) if areas else 0,
            'mean_perimeter': np.mean(perimeters) if perimeters else 0,
            'std_perimeter': np.std(perimeters) if perimeters else 0
        }
        
        return contour_features
        
    except Exception as e:
        logger.error(f"Contour feature extraction error: {str(e)}")
        return {}

def calculate_entropy(image):
    """
    Calculate image entropy
    """
    try:
        # Calculate histogram
        hist = cv2.calcHist([image], [0], None, [256], [0, 256])
        
        # Normalize histogram
        hist = hist.ravel()
        hist = hist[hist > 0]  # Remove zeros
        hist = hist / np.sum(hist)
        
        # Calculate entropy
        entropy = -np.sum(hist * np.log2(hist))
        
        return float(entropy)
        
    except Exception as e:
        logger.error(f"Entropy calculation error: {str(e)}")
        return 0.0

def extract_text_features(text):
    """
    Extract features from OCR text
    """
    features = {}
    
    try:
        if not text or not text.strip():
            return {
                'word_count': 0,
                'char_count': 0,
                'line_count': 0,
                'numeric_ratio': 0.0,
                'alpha_ratio': 0.0,
                'special_char_ratio': 0.0
            }
        
        # Basic text statistics
        words = text.split()
        lines = text.split('\n')
        
        features['word_count'] = len(words)
        features['char_count'] = len(text)
        features['line_count'] = len(lines)
        features['avg_word_length'] = np.mean([len(word) for word in words]) if words else 0
        
        # Character type ratios
        numeric_chars = sum(1 for c in text if c.isdigit())
        alpha_chars = sum(1 for c in text if c.isalpha())
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
        
        total_chars = len(text)
        features['numeric_ratio'] = numeric_chars / total_chars if total_chars > 0 else 0
        features['alpha_ratio'] = alpha_chars / total_chars if total_chars > 0 else 0
        features['special_char_ratio'] = special_chars / total_chars if total_chars > 0 else 0
        
        # Pattern detection
        features['patterns'] = detect_text_patterns(text)
        
        # Text quality metrics
        features['quality'] = assess_text_quality(text)
        
    except Exception as e:
        logger.error(f"Text feature extraction error: {str(e)}")
    
    return features

def detect_text_patterns(text):
    """
    Detect common patterns in text
    """
    patterns = {}
    
    try:
        # Date patterns
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY or MM-DD-YYYY
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',     # YYYY/MM/DD or YYYY-MM-DD
            r'\w+ \d{1,2}, \d{4}'               # Month DD, YYYY
        ]
        
        dates_found = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            dates_found.extend(matches)
        
        patterns['dates'] = dates_found
        
        # ID number patterns
        id_patterns = [
            r'[A-Z]{1,2}\d{6,9}',  # Passport style
            r'\d{9,12}',           # Simple ID numbers
            r'[A-Z0-9]{8,15}'      # Mixed alphanumeric
        ]
        
        ids_found = []
        for pattern in id_patterns:
            matches = re.findall(pattern, text.upper())
            ids_found.extend(matches)
        
        patterns['id_numbers'] = ids_found
        
        # Phone number patterns
        phone_patterns = [
            r'\(\d{3}\)\s*\d{3}-\d{4}',  # (XXX) XXX-XXXX
            r'\d{3}-\d{3}-\d{4}',        # XXX-XXX-XXXX
            r'\d{10,}'                   # 10+ digits
        ]
        
        phones_found = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            phones_found.extend(matches)
        
        patterns['phone_numbers'] = phones_found
        
        # Email patterns
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        patterns['emails'] = re.findall(email_pattern, text)
        
        # Address patterns (simplified)
        address_patterns = [
            r'\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)',
            r'P\.?O\.?\s+Box\s+\d+'
        ]
        
        addresses_found = []
        for pattern in address_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            addresses_found.extend(matches)
        
        patterns['addresses'] = addresses_found
        
    except Exception as e:
        logger.error(f"Pattern detection error: {str(e)}")
    
    return patterns

def assess_text_quality(text):
    """
    Assess the quality of extracted text
    """
    quality_metrics = {}
    
    try:
        if not text or not text.strip():
            return {
                'readability_score': 0.0,
                'coherence_score': 0.0,
                'completeness_score': 0.0
            }
        
        # Readability assessment (simplified)
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if words and sentences:
            avg_words_per_sentence = len(words) / len(sentences)
            avg_chars_per_word = np.mean([len(word) for word in words])
            
            # Simple readability score (inverse of complexity)
            readability = 1.0 / (1.0 + avg_words_per_sentence * 0.1 + avg_chars_per_word * 0.1)
            quality_metrics['readability_score'] = min(readability, 1.0)
        else:
            quality_metrics['readability_score'] = 0.0
        
        # Coherence assessment (based on word repetition and structure)
        unique_words = set(word.lower() for word in words if word.isalpha())
        if words:
            coherence = len(unique_words) / len(words)
            quality_metrics['coherence_score'] = min(coherence * 2, 1.0)  # Scale up
        else:
            quality_metrics['coherence_score'] = 0.0
        
        # Completeness assessment (based on expected document elements)
        completeness_indicators = [
            bool(re.search(r'\d', text)),  # Contains numbers
            bool(re.search(r'[A-Z]', text)),  # Contains uppercase
            bool(re.search(r'[a-z]', text)),  # Contains lowercase
            len(text) > 50,  # Sufficient length
            len(words) > 10  # Sufficient word count
        ]
        
        quality_metrics['completeness_score'] = sum(completeness_indicators) / len(completeness_indicators)
        
    except Exception as e:
        logger.error(f"Text quality assessment error: {str(e)}")
        quality_metrics = {
            'readability_score': 0.0,
            'coherence_score': 0.0,
            'completeness_score': 0.0
        }
    
    return quality_metrics

def compare_documents(doc1_features, doc2_features):
    """
    Compare two documents based on their features
    """
    try:
        similarity_scores = {}
        
        # Compare dimensions
        if 'dimensions' in doc1_features and 'dimensions' in doc2_features:
            dim1 = doc1_features['dimensions']
            dim2 = doc2_features['dimensions']
            
            aspect_ratio_diff = abs(dim1['aspect_ratio'] - dim2['aspect_ratio'])
            similarity_scores['dimension_similarity'] = 1.0 - min(aspect_ratio_diff, 1.0)
        
        # Compare texture features
        if 'texture' in doc1_features and 'texture' in doc2_features:
            tex1 = doc1_features['texture']
            tex2 = doc2_features['texture']
            
            if 'mean_intensity' in tex1 and 'mean_intensity' in tex2:
                intensity_diff = abs(tex1['mean_intensity'] - tex2['mean_intensity']) / 255.0
                similarity_scores['texture_similarity'] = 1.0 - intensity_diff
        
        # Overall similarity (average of available scores)
        if similarity_scores:
            similarity_scores['overall_similarity'] = np.mean(list(similarity_scores.values()))
        else:
            similarity_scores['overall_similarity'] = 0.0
        
        return similarity_scores
        
    except Exception as e:
        logger.error(f"Document comparison error: {str(e)}")
        return {'overall_similarity': 0.0}
