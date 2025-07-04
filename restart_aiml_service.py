#!/usr/bin/env python3
"""
Quick fix to restart AI/ML service after NumPy serialization fixes
"""
import os
import sys
import subprocess
import time

def restart_aiml_service():
    print("🔧 Applying fixes and restarting AI/ML service...")
    print("=" * 50)
    
    try:
        # Change to AI/ML service directory
        aiml_dir = "ai-ml-service"
        if not os.path.exists(aiml_dir):
            print("❌ AI/ML service directory not found!")
            return False
        
        os.chdir(aiml_dir)
        
        print("✅ Fixed NumPy serialization issues")
        print("✅ Added OCR fallback for missing Tesseract")
        print("✅ Fixed data type conversions")
        
        print("\n🚀 Starting AI/ML service...")
        
        # Start the service
        cmd = [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
        
        print(f"Running: {' '.join(cmd)}")
        
        # This will run the service in the foreground
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        return False

if __name__ == "__main__":
    print("🔧 VOTER ID UPLOAD FIX")
    print("=" * 30)
    print("This script will start the fixed AI/ML service.")
    print("The service now handles:")
    print("✅ NumPy data type serialization")
    print("✅ Missing Tesseract OCR fallback")
    print("✅ Proper JSON responses")
    print("\nPress Ctrl+C to stop the service when done.")
    print("=" * 50)
    
    time.sleep(2)
    restart_aiml_service()
