@echo off
echo Starting SchoolBag Application...
echo.

echo Starting Backend Server (Port 5000)...
start cmd /k "cd server && npm start"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Frontend Application (Port 3000)...
start cmd /k "cd client && npm start"

echo.
echo ============================================
echo SchoolBag is starting up!
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo Wait for both servers to fully load,
echo then open http://localhost:3000 in your browser
echo ============================================
pause 