#!/usr/bin/env python3
"""
Test script for AI/ML Service endpoints
"""
import requests
import json
import base64
from PIL import Image, ImageDraw, ImageFont
import io

# Configuration
AI_ML_URL = "http://localhost:8000"

def create_test_image():
    """Create a simple test image with text"""
    # Create a white image
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add some text
    text = "Sample Document\nInvoice #12345\nAmount: $1,000.00\nDate: 2025-06-30"
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    draw.text((20, 20), text, fill='black', font=font)
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    return img_byte_arr

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing AI/ML Service Health...")
    try:
        response = requests.get(f"{AI_ML_URL}/")
        print(f"✅ Health Check: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False

def test_extract_text():
    """Test text extraction endpoint"""
    print("🔍 Testing Text Extraction...")
    try:
        # Test with simple text data first
        data = {"text": "Sample document for text extraction testing"}
        response = requests.post(f"{AI_ML_URL}/extract-text", json=data)
        print(f"✅ Text Extraction: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Text Extraction Error: {e}")
        return False

def test_classify_document():
    """Test document classification endpoint"""
    print("🔍 Testing Document Classification...")
    try:
        data = {
            "text": "Invoice #12345 Amount: $1,000.00 Due Date: 2025-07-30 Customer: John Doe"
        }
        response = requests.post(f"{AI_ML_URL}/classify-document", json=data)
        print(f"✅ Document Classification: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Document Classification Error: {e}")
        return False

def test_verify_document():
    """Test document verification endpoint"""
    print("🔍 Testing Document Verification...")
    try:
        data = {
            "document_type": "invoice",
            "extracted_data": {
                "amount": "1000.00",
                "invoice_number": "12345",
                "date": "2025-06-30"
            }
        }
        response = requests.post(f"{AI_ML_URL}/verify-document", json=data)
        print(f"✅ Document Verification: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Document Verification Error: {e}")
        return False

def test_image_upload():
    """Test image upload and processing"""
    print("🔍 Testing Image Upload...")
    try:
        # Create test image
        img_data = create_test_image()
        
        # Upload image
        files = {'file': ('test_document.png', img_data, 'image/png')}
        response = requests.post(f"{AI_ML_URL}/extract-text", files=files)
        print(f"✅ Image Upload: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Image Upload Error: {e}")
        return False

def run_all_tests():
    """Run all AI/ML service tests"""
    print("🚀 Starting AI/ML Service Tests\n")
    
    tests = [
        ("Health Check", test_health),
        ("Text Extraction", test_extract_text),
        ("Document Classification", test_classify_document),
        ("Document Verification", test_verify_document),
        ("Image Upload", test_image_upload),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
        print()  # Add spacing between tests
    
    # Summary
    print("📊 Test Results Summary:")
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    return results

if __name__ == "__main__":
    run_all_tests()
