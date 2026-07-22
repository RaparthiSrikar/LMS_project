#!/bin/bash
echo "Starting Enterprise LMS full-stack servers..."

# Start Django Backend in the background
echo "Starting Django Backend..."
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver &
BACKEND_PID=$!

# Start Vite Frontend
echo "Starting Vite Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
