@echo off
echo Testing Document Verification System endpoints...
echo.

echo Testing Backend Health (Port 5001):
curl -s http://localhost:5001/api/health
echo.
echo.

echo Testing AI/ML Service Health (Port 8000):
curl -s http://localhost:8000/health
echo.
echo.

echo Testing Frontend (Port 3000):
curl -s -I http://localhost:3000 | findstr "200 OK"
if %errorlevel% equ 0 (
    echo ✓ Frontend is accessible
) else (
    echo ✗ Frontend not accessible
)
echo.

echo All tests complete!
pause
