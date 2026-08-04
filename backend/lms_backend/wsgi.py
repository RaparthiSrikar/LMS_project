"""
WSGI config for lms_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')

application = get_wsgi_application()

def setup_vercel_database():
    """Auto-migrate and seed initial demo accounts and published courses on Vercel deployment if tables don't exist."""
    try:
        from django.db import connection
        from django.core.management import call_command
        from accounts.models import User
        from courses.models import Category, Tag, Course
        from trainers.models import Note, Video, LiveSession
        from students.models import Enrollment, VideoProgress
        from assignments.models import Assignment
        from django.utils import timezone
        import datetime

        table_names = connection.introspection.table_names()
        if "accounts_user" not in table_names:
            print("Auto-running database migrations on Vercel deployment...")
            call_command("migrate", interactive=False)

        # 1. Seed initial demo accounts if database has no users
        if User.objects.count() == 0:
            print("Seeding initial demo user accounts...")
            demo_users = [
                {
                    "email": "student@test.com",
                    "username": "student@test.com",
                    "password": "Student@1234",
                    "role": User.Role.STUDENT,
                    "first_name": "Demo",
                    "last_name": "Student",
                },
                {
                    "email": "trainer@test.com",
                    "username": "trainer@test.com",
                    "password": "Trainer@1234",
                    "role": User.Role.TRAINER,
                    "first_name": "Demo",
                    "last_name": "Trainer",
                },
                {
                    "email": "admin@test.com",
                    "username": "admin@test.com",
                    "password": "Admin@1234",
                    "role": User.Role.ADMIN,
                    "first_name": "Demo",
                    "last_name": "Admin",
                    "is_staff": True,
                    "is_superuser": True,
                },
            ]
            for u_data in demo_users:
                pwd = u_data.pop("password")
                user = User(**u_data, is_email_verified=True, is_active_account=True)
                user.set_password(pwd)
                user.save()
            print("Demo user accounts seeded successfully!")

        # Ensure all courses are marked as published so students can see and enroll in them
        Course.objects.filter(is_published=False).update(is_published=True)

        # 2. Seed published courses if no courses exist
        if Course.objects.count() == 0:
            print("Seeding sample courses for student portal...")
            student = User.objects.filter(email="student@test.com").first()
            trainer = User.objects.filter(email="trainer@test.com").first() or User.objects.filter(role="trainer").first()

            cat_dev, _ = Category.objects.get_or_create(name="Software Engineering")
            cat_ds, _ = Category.objects.get_or_create(name="Data Science & AI")
            cat_cloud, _ = Category.objects.get_or_create(name="Cloud & Infrastructure")
            cat_design, _ = Category.objects.get_or_create(name="Design & Experience")

            tag_react, _ = Tag.objects.get_or_create(name="React")
            tag_django, _ = Tag.objects.get_or_create(name="Django")
            tag_python, _ = Tag.objects.get_or_create(name="Python")
            tag_aws, _ = Tag.objects.get_or_create(name="AWS")

            c1 = Course.objects.create(
                name="Full-Stack Web Development Masterclass",
                category=cat_dev,
                level=Course.Level.BEGINNER,
                duration_weeks=8,
                description="Master modern web development from HTML5, CSS3, JavaScript ES6+, React 18, and Django REST Framework to cloud deployments.",
                price=99.99,
                discount_percent=20.00,
                trainer=trainer,
                is_published=True,
            )
            c1.tags.add(tag_react, tag_django)

            c2 = Course.objects.create(
                name="Data Science & Machine Learning with Python",
                category=cat_ds,
                level=Course.Level.INTERMEDIATE,
                duration_weeks=10,
                description="Learn NumPy, Pandas, Scikit-Learn, TensorFlow, and statistical analysis for real-world artificial intelligence models.",
                price=149.99,
                discount_percent=15.00,
                trainer=trainer,
                is_published=True,
            )
            c2.tags.add(tag_python)

            c3 = Course.objects.create(
                name="Cloud Computing & DevOps Essentials",
                category=cat_cloud,
                level=Course.Level.INTERMEDIATE,
                duration_weeks=6,
                description="Docker, Kubernetes, AWS, CI/CD pipelines, Terraform, and modern microservice deployment patterns.",
                price=129.99,
                discount_percent=10.00,
                trainer=trainer,
                is_published=True,
            )
            c3.tags.add(tag_aws)

            c4 = Course.objects.create(
                name="UI/UX Design Systems & Figma Architecture",
                category=cat_design,
                level=Course.Level.BEGINNER,
                duration_weeks=4,
                description="Build modern design systems, interactive prototypes, responsive layouts, and user research workflows.",
                price=79.99,
                discount_percent=25.00,
                trainer=trainer,
                is_published=True,
            )

            today = timezone.localtime(timezone.now()).date()
            v1 = Video.objects.create(
                course=c1,
                title="1. Introduction to Web Architecture & HTML5",
                url="https://www.w3schools.com/html/mov_bbb.mp4",
                duration_minutes=25,
                date=today - datetime.timedelta(days=1),
            )
            v2 = Video.objects.create(
                course=c1,
                title="2. CSS3 Flexbox & Modern Responsive Layouts",
                url="https://www.w3schools.com/html/mov_bbb.mp4",
                duration_minutes=40,
                date=today,
            )
            v3 = Video.objects.create(
                course=c1,
                title="3. JavaScript ES6+ & Async/Await Deep Dive",
                url="https://www.w3schools.com/html/mov_bbb.mp4",
                duration_minutes=45,
                date=today + datetime.timedelta(days=1),
            )
            v4 = Video.objects.create(
                course=c1,
                title="4. Building SPA Apps with React 18 & Hooks",
                url="https://www.w3schools.com/html/mov_bbb.mp4",
                duration_minutes=50,
                date=today + datetime.timedelta(days=2),
            )

            Note.objects.create(
                course=c1,
                title="Lecture 1: Web Development Roadmap PDF",
                date=today - datetime.timedelta(days=1),
            )
            Assignment.objects.create(
                course=c1,
                title="Assignment 1: Build a Responsive Landing Page",
                description="Create a responsive single page using HTML5 and CSS Flexbox. Submit your repository URL.",
                max_marks=100,
                due_date=timezone.now() + datetime.timedelta(days=5),
                date=today + datetime.timedelta(days=3),
            )
            LiveSession.objects.create(
                course=c1,
                title="Live Q&A & Code Review Session",
                meeting_link="https://meet.google.com/abc-defg-hij",
                scheduled_at=timezone.now() + datetime.timedelta(days=2, hours=3),
                duration_minutes=60,
            )

            if student:
                enr, _ = Enrollment.objects.get_or_create(student=student, course=c1)
                VideoProgress.objects.get_or_create(enrollment=enr, video=v1, defaults={"watched": True, "watched_at": timezone.now()})
                VideoProgress.objects.get_or_create(enrollment=enr, video=v2, defaults={"watched": False})
                VideoProgress.objects.get_or_create(enrollment=enr, video=v3, defaults={"watched": False})
                VideoProgress.objects.get_or_create(enrollment=enr, video=v4, defaults={"watched": False})
                enr.progress_percent = 25
                enr.save()

            print("Sample courses, content, and student enrollment seeded successfully!")

    except Exception as e:
        print(f"Vercel DB setup note: {e}")

if os.environ.get("VERCEL") == "1":
    setup_vercel_database()

app = application


