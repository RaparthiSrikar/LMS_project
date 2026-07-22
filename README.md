# Enterprise Learning Management System (LMS)

Full-stack scaffold generated from the project brief — 30-day build, React + Django REST Framework + PostgreSQL.

## Stack
- **Frontend:** React 18 (Vite), React Router, Axios, JWT auth with auto-refresh
- **Backend:** Python, Django 5, Django REST Framework, Simple JWT
- **Database:** PostgreSQL (SQLite by default for local dev — see `.env.example`)

## Structure
```
backend/     Django project (9 apps, one per module group)
  accounts/     Module 1 & 2 — Auth, roles, OTP, password reset, user management
  courses/      Module 5 — Categories, tags, course CRUD
  trainers/     Module 3 — Notes, videos, live sessions, announcements
  students/     Module 4 — Enrollment & progress tracking
  payments/     Module 6 — Stripe/Razorpay payments, coupons, invoices, refunds
  assignments/  Module 7 — Assignments & submissions, evaluation
  quizzes/      Module 8 — MCQ/True-False/Coding quizzes, auto-eval, leaderboard
  dashboard/    Module 9 — Admin dashboard aggregation API
  reports/      Module 10 — PDF/Excel report generation
frontend/    React app (Vite) — one page per module, shared CRUD component
```

## Running locally

### Single-Command Start (Windows & Unix)
To automatically apply database migrations, start the Django API, and launch the Vite development server in one go:
- **Windows:** Double-click `run.bat` or run:
  ```bash
  .\run.bat
  ```
- **Unix/macOS:** Run:
  ```bash
  chmod +x run.sh && ./run.sh
  ```

### Manual Bootstrapping

#### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # defaults to SQLite; set USE_SQLITE=false + DB_* for Postgres
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # http://localhost:8000
```

#### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:3000
```

## What's implemented (breadth-first scaffold)
Every module from the brief has working models, DRF serializers/viewsets, and a connected React page:

1. **Auth & Roles** — register, login, logout, JWT + refresh, forgot/reset password, email verification & login OTP, 5 roles (Super Admin, Admin, Trainer, Student, HR)
2. **User Management** — admin CRUD, activate/deactivate, admin password reset, profile picture upload
3. **Trainer Management** — course CRUD, notes/video upload, live session scheduling, announcements
4. **Student Management** — enrollment, video-watch progress tracking
5. **Course Management** — all fields from the brief (category, level, price, discount, thumbnail, banner, preview, tags, trainer)
6. **Payment Module** — Stripe/Razorpay gateway field, GST calculation, coupon system, invoice auto-generation, refund workflow
7. **Assignment Module** — create/upload/due-date/marks, student submit/resubmit, trainer evaluate/remarks/publish
8. **Quiz Module** — MCQ/True-False/Coding question types, timed quizzes, negative marking, auto-evaluation, leaderboard
9. **Dashboard** — all 9 admin cards (students, trainers, revenue, active courses, pending assignments, growth, completion rate, logins, active users)
10. **Reports** — Student/Attendance/Assignment/Quiz/Trainer-performance reports, downloadable as PDF or Excel

## What to harden before production
- Swap the console email backend for real SMTP; wire OTP/reset emails into actual templates
- Integrate the real Stripe/Razorpay server SDKs (fields and settings are already in place: `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_*`)
- Add automated tests, request throttling on auth endpoints, and stricter file-upload validation
- Replace `SECRET_KEY`/`DEBUG=True`/`ALLOWED_HOSTS=["*"]` with production values
- Add pagination/infinite-scroll UI polish and role-specific dashboard variants (Trainer/Student dashboards currently share the admin cards endpoint)

## Note
The uploaded brief included a plaintext database password at the end of the document. That was **not** used anywhere in this scaffold — treat it as compromised and rotate it if it's a real credential.
