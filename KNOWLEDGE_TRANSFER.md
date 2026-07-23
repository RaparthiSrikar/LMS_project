# Knowledge Transfer (KT) Document: Enterprise LMS Project

Welcome to the **Enterprise Learning Management System (LMS)** codebase. This document serves as a complete technical guide to the system's architecture, database models, frontend structure, workflows, and deployment setups.

---

## 1. High-Level Architecture Overview

The system follows a decoupling of concerns, utilizing a **Single Page Application (SPA)** frontend talking to a **RESTful Web Services** backend.

```
+------------------------------------+
|    React SPA Frontend - Vite       |
+-----------------+------------------+
                  |
                  | (JSON over HTTP / JWT Auth)
                  v
+-----------------+------------------+
| Django REST Framework Backend      |
+-----------------+------------------+
                  |
                  | (SQL Queries)
                  v
+-----------------+------------------+
| Supabase PostgreSQL Database      |
| (Local fallback to SQLite)         |
+------------------------------------+
```

### Key Tech Stack
- **Frontend:** React 18, Vite (Server port 3010), Axios, React Router v6, custom CSS variables.
- **Backend:** Python 3.x, Django 5.x, Django REST Framework (DRF), Simple JWT for auth.
- **Database:** PostgreSQL (production-ready Supabase hosting), local development fallback to SQLite.
- **Hosting/Deployment:** Ready for deployment on Vercel (`vercel.json` configurations are included in both folders).

---

## 2. Backend Architecture (`/backend`)

The backend is built as a modular Django project named `lms_backend` comprising 9 local apps structured around functional modules.

### Directory Structure
```
backend/
├── accounts/      # User management, roles, and OTP validation
├── assignments/   # Assignment declarations, student submissions, evaluation
├── courses/       # Course categories, tags, and course listings
├── dashboard/     # Aggregated stats for Admin & personalized Trainer dashboard
├── lms_backend/   # Project configuration, URLs, WSGI, and settings
├── payments/      # Payment gateway config, coupon codes, and invoices
├── quizzes/       # Dynamic quizzes (MCQs, Coding challenges, leaderboards)
├── reports/       # Report generation in Excel (openpyxl) and PDF (reportlab)
├── students/      # Course enrollments and lesson-watching progress tracking
├── trainers/      # Notes, video uploads, live class scheduling, announcements
├── requirements.txt # Python packages dependencies list
└── vercel.json    # Serverless deployment configuration
```

---

## 3. Database Schema & Data Models

### 3.1 accounts (Authentication & Roles)
- **`User` (inherits `AbstractUser`)**: Custom user entity using `email` as the primary username field. 
  - **Roles (`role`)**: Supported values are `super_admin`, `admin`, `trainer`, `student`, and `hr`.
  - **Status Fields**: `is_active_account` (admin-controlled switch) and `is_email_verified`.
- **`OTP`**: Generates and stores 6-digit verification codes for `email_verification`, `login`, and `password_reset` with a 10-minute validity expiry.
- **`PasswordResetToken`**: Handles link-based reset flows using UUID tokens expiring in 1 hour.

### 3.2 courses (Content Framework)
- **`Category` & `Tag`**: Simple lookups to group and classify courses.
- **`Course`**: Holds course details (duration, difficulty `level`, `price`, `discount_percent`, media banners, thumbnails, preview video link, and assigned `trainer`).

### 3.3 trainers (Content Delivery)
- **`Note`**: Lecture slides and document PDF links uploaded by trainers.
- **`Video`**: Video files or links (e.g. YouTube/Vimeo) attached to courses.
- **`LiveSession`**: Google Meet/Zoom integration schedule with auto-reminders.
- **`Announcement`**: Real-time course announcements sent to enrolled students.

### 3.4 students (Enrollment & Progress)
- **`Enrollment`**: Tracks student mapping to a course, overall completion rate (`progress_percent`), and pause statuses.
- **`VideoProgress`**: Tracks individual video watch progress (`watched` boolean) used to compute the total course progress.

### 3.5 payments (Finance)
- **`Coupon`**: Dynamic coupon codes with discount rates, validity checks, and maximum usage counters.
- **`Payment`**: Logs payments, VAT/GST amounts, Stripe/Razorpay reference tokens, and payment statuses (`pending`, `success`, `failed`, `refunded`).
- **`Invoice`**: Links to successful payments, auto-generating a unique UUID invoice receipt.
- **`Refund`**: Manages user refund requests (`requested`, `approved`, `rejected`, `completed`).

### 3.6 assignments (Assessment)
- **`Assignment`**: Defined by trainers, setting max marks, description files, and due dates.
- **`Submission`**: Logs student files, grading scores, review remarks, evaluation dates, and publication status.

### 3.7 quizzes (Gamified Testing)
- **`Quiz`**: Timed test modules supporting negative marks.
- **`Question`**: Supports `MCQ`, `True/False`, and `Coding` type challenges.
- **`Choice`**: MCQ/True-False answers linked to questions with correct flags.
- **`QuizAttempt` & `Answer`**: Stores student responses (choice selection or typed starter code), scores, and auto-evaluation outputs.

### 3.8 dashboard (Analytics & Summaries)
Does not define models. Rather, views fetch telemetry queries:
- **`AdminDashboardView`**: Aggregates total students/trainers count, gross revenues, daily logins, active users, growth metrics, and course completions.
- **`TrainerDashboardView`**: Personalised summary showing courses taught, active learners, outstanding assignments to grade, and upcoming scheduled live classes.

### 3.9 reports (Data Exports)
Extracts database rows dynamically and generates attachments using helper classes:
- **`StudentReportView`**: Student demographic list.
- **`AttendanceReportView`**: Tracks progress percentage & completion flags.
- **`AssignmentReportView`**: Records submission statuses and grades.
- **`QuizReportView`**: Exposes leaderboard attempt details.
- **`TrainerPerformanceReportView`**: Renders count of trainers, courses, and student volumes.
- Supported output formats: `?format=pdf` (ReportLab drawing canvas) or `?format=excel` (openpyxl worksheet).

---

## 4. Frontend Architecture (`/frontend`)

The frontend is built with React 18, structured around component layouts, application state contexts, and page views.

```
frontend/
├── src/
│   ├── api/          # Axios HTTP clients and interceptors
│   ├── components/   # Structural components (Sidebar layout, route guards)
│   ├── context/      # Auth state providers
│   ├── pages/        # 36 separate views mapped to various user actions
│   ├── index.css     # Global theme configuration and custom variables
│   ├── App.jsx       # Route registry and app entry layout wrapper
│   └── main.jsx      # React DOM bootstrap
├── .env              # Environment configurations (API URL, keys)
├── package.json      # Dependencies and execution scripts
└── vercel.json       # Rewrites for SPA URL support on Vercel CDN
```

### 4.1 Routing & Navigation
- The routing table is declared in `App.jsx` using `react-router-dom`.
- Views are protected using the `ProtectedRoute` wrapper, which checks if the user is authenticated.
- **`Layout.jsx`**: Houses the main sidebar navigation. It changes dynamically depending on the active user's roles (`super_admin`, `admin`, `trainer`, `student`, `hr`), hiding modules that aren't permitted for the current user.

### 4.2 State Management & Authentication Flow
- **`AuthContext.jsx`**: Provides `user` profile data, `login()`, and `logout()` triggers globally.
- **Axios Interceptor (`frontend/src/api/client.js`)**:
  - **Outgoing Requests**: Intercepts outgoing HTTP calls to inject the active `access_token` into the authorization headers as `Bearer <token>`.
  - **Token Refresh (Auto-refresh on 401)**: If an API request fails with a `401 Unauthorized` status (due to token expiration), the response interceptor catches it, halts subsequent calls, requests a new access token from `/api/auth/token/refresh/` using the stored `refresh_token`, updates `localStorage`, and retries the original request seamlessly.

---

## 5. Deployment & Configuration

### Backend Deployment (`backend/vercel.json`)
The backend is set up as a serverless function pointing to the WSGI gateway:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "lms_backend/wsgi.py",
      "use": "@vercel/python",
      "config": { "maxDuration": 60 }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "lms_backend/wsgi.py"
    }
  ]
}
```

### Frontend Environment Setup
Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=https://lms-project-beta-five.vercel.app/api
VITE_SUPABASE_URL=https://<your-supabase-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## 6. Hardening Checklist Before Going to Production

To transition this project from development/scaffold mode to production, complete the following items:

1. **Security Settings (`backend/lms_backend/settings.py`)**:
   - Turn off debugging: `DEBUG = False`.
   - Restrict ALLOWED_HOSTS: `ALLOWED_HOSTS = ["lms-project-beta-five.vercel.app"]` (or your domain).
   - Set a strong Django secret key in the Vercel env variable: `DJANGO_SECRET_KEY`.
2. **Email System**:
   - Replace the dev-console backend `ConsoleEmailBackend` in Django settings with a real SMTP client (e.g. Amazon SES, SendGrid, Mailgun).
3. **Database Migration**:
   - For PostgreSQL databases in production, run `python manage.py migrate` on the database container to populate table schemas.
4. **Third-Party SDK Integrations**:
   - Replace dummy Stripe and Razorpay flows on the frontend/backend with real server SDK operations using the settings keys (`STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
