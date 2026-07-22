@echo off
echo Starting Enterprise LMS full-stack servers...

:: Launch Backend Server
echo Starting Django Backend...
start "LMS Backend (Django)" cmd /k "cd backend && venv\Scripts\python manage.py migrate && venv\Scripts\python manage.py runserver"

:: Launch Frontend Server
echo Starting Vite Frontend...
start "LMS Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo Project is launching!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause
