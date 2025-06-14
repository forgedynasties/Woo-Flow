@echo off
echo ===================================
echo WooKit - Setup Script
echo ===================================
echo.

echo Setting up Backend...
cd Backend
pip install -r requirements.txt
echo Backend setup complete!
echo.

echo Setting up Frontend...
cd ..\Frontend
call npm install
echo Frontend setup complete!
echo.

echo ===================================
echo Setup complete! You can now run:
echo - start.cmd to start both backend and frontend
echo - start_frontend.cmd to start only the frontend
echo - start_backend.cmd to start only the backend
echo ===================================

cd ..
pause
