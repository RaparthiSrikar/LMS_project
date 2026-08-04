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
    """Auto-migrate and seed initial demo accounts on Vercel deployment if tables don't exist."""
    try:
        from django.db import connection
        from django.core.management import call_command
        from accounts.models import User

        table_names = connection.introspection.table_names()
        if "accounts_user" not in table_names:
            print("Auto-running database migrations on Vercel deployment...")
            call_command("migrate", interactive=False)

        # Seed initial demo accounts if database has no users
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
    except Exception as e:
        print(f"Vercel DB setup note: {e}")

if os.environ.get("VERCEL") == "1":
    setup_vercel_database()

app = application


