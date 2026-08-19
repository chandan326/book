@echo off
echo ======================================================================
echo Starting AI Book Creation, Editing, Publishing & Reader Platform
echo ======================================================================

echo Launching FastAPI Backend Server on http://127.0.0.1:8000 ...
start "FastAPI Backend (Port 8000)" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Launching Vite React Frontend on http://127.0.0.1:5173 ...
start "Vite Frontend (Port 5173)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching!
echo App URL:        http://127.0.0.1:5173
echo Backend API:    http://127.0.0.1:8000
echo API Docs:       http://127.0.0.1:8000/docs
echo Super Admin:    chandan.rai771714@gmail.com
echo ======================================================================
