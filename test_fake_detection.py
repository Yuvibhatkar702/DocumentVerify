#!/usr/bin/env python3
"""
Test script for fake document detection
"""
import requests
import json
import time
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_test_fake_document():
    """Create a test fake document with obvious fake indicators"""
    # Create a simple fake ID card
    img = Image.new('RGB', (800, 500), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add obvious fake text
    draw.text((50, 50), "FAKE ID CARD", fill='red')
    draw.text((50, 100), "SAMPLE DOCUMENT", fill='black')
    draw.text((50, 150), "NOT VALID FOR IDENTIFICATION", fill='red')
    draw.text((50, 200), "TEST SPECIMEN", fill='black')
    
    # Save the fake document
    fake_doc_path = "test_fake_document.jpg"
    img.save(fake_doc_path)
    return fake_doc_path

def test_document_verification():
    """Test document verification with fake document"""
    # Create a fake document
    fake_doc_path = create_test_fake_document()
    
    try:
        # Test with backend API
        print("Testing document verification with fake document...")
        
        # Simulate upload to backend
        server_url = "http://localhost:5001"
        
        # First, we need to test the AI/ML service directly
        ai_service_url = "http://localhost:8000"
        
        with open(fake_doc_path, 'rb') as f:
            files = {'file': f}
            data = {'document_type': 'id-card'}
            
            response = requests.post(f"{ai_service_url}/api/v1/analyze", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"AI/ML Service Response:")
                print(f"- Valid: {result.get('is_valid', False)}")
                print(f"- Confidence: {result.get('confidence_score', 0)}")
                print(f"- Anomalies: {result.get('anomalies', [])}")
                print(f"- Quality Score: {result.get('quality_score', 0)}")
                
                if not result.get('is_valid', True):
                    print("✅ SUCCESS: Fake document correctly detected!")
                else:
                    print("❌ FAILURE: Fake document was incorrectly verified!")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"❌ Error testing: {e}")
    
    finally:
        # Clean up
        if os.path.exists(fake_doc_path):
            os.remove(fake_doc_path)

if __name__ == "__main__":
    test_document_verification()
