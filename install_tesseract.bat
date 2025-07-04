@echo off
echo Installing Tesseract OCR for Windows...
echo.
echo Please follow these steps:
echo.
echo 1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
echo 2. Install the Windows installer (tesseract-ocr-w64-setup-5.3.3.20231005.exe or latest)
echo 3. During installation, make sure to check "Add to PATH"
echo 4. Default installation path is usually: C:\Program Files\Tesseract-OCR
echo.
echo After installation, restart your command prompt and try again.
echo.
echo Alternative: If you have Chocolatey installed, run:
echo choco install tesseract
echo.
echo Or with winget:
echo winget install UB-Mannheim.TesseractOCR
echo.
pause
