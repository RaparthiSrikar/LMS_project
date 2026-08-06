"""
Django settings for lms_backend project — Enterprise LMS.
"""
from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file into os.environ if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

# Prevent SynchronousOnlyOperation on Vercel serverless environment
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")

DEBUG = True

ALLOWED_HOSTS = ["*"]

# ------------------------------------------------------------------
# Applications
# ------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",

    # local apps
    "accounts",
    "courses",
    "trainers",
    "students",
    "payments",
    "assignments",
    "quizzes",
    "dashboard",
    "reports",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "lms_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "lms_backend.wsgi.application"

try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

# ------------------------------------------------------------------
# Database — MySQL / PostgreSQL / SQLite
# ------------------------------------------------------------------
database_url = (
    os.environ.get("DATABASE_URL")
    or os.environ.get("DATABASE_PUBLIC_URL")
    or os.environ.get("DATABASE_PRIVATE_URL")
    or os.environ.get("RAILWAY_DATABASE_URL")
)

has_db_env = bool(database_url) or bool(os.environ.get("DB_HOST")) or bool(os.environ.get("PGHOST"))
use_sqlite = os.environ.get("USE_SQLITE", "").lower() == "true" if "USE_SQLITE" in os.environ else not has_db_env

db_engine_setting = os.environ.get("DB_ENGINE", "").lower()

if not use_sqlite and has_db_env:
    if database_url:
        try:
            import dj_database_url
            DATABASES = {
                "default": dj_database_url.config(
                    default=database_url,
                    conn_max_age=600,
                    conn_health_checks=True,
                )
            }
        except ImportError:
            import urllib.parse
            url = urllib.parse.urlparse(database_url)
            engine = "django.db.backends.mysql" if "mysql" in url.scheme else "django.db.backends.postgresql"
            DATABASES = {
                "default": {
                    "ENGINE": engine,
                    "NAME": url.path.lstrip("/"),
                    "USER": url.username or "",
                    "PASSWORD": urllib.parse.unquote(url.password or ""),
                    "HOST": url.hostname or "localhost",
                    "PORT": str(url.port or (3306 if "mysql" in engine else 5432)),
                }
            }
    elif db_engine_setting == "mysql" or os.environ.get("DB_PORT") == "3306":
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.mysql",
                "NAME": os.environ.get("DB_NAME", "lms_db"),
                "USER": os.environ.get("DB_USER", "root"),
                "PASSWORD": os.environ.get("DB_PASSWORD", ""),
                "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
                "PORT": os.environ.get("DB_PORT", "3306"),
                "OPTIONS": {
                    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                },
            }
        }
    else:
        # Check standard PG* variables (Railway native) vs custom DB_* variables
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.environ.get("PGDATABASE") or os.environ.get("DB_NAME", "postgres"),
                "USER": os.environ.get("PGUSER") or os.environ.get("DB_USER", "postgres"),
                "PASSWORD": os.environ.get("PGPASSWORD") or os.environ.get("DB_PASSWORD", ""),
                "HOST": os.environ.get("PGHOST") or os.environ.get("DB_HOST", "localhost"),
                "PORT": os.environ.get("PGPORT") or os.environ.get("DB_PORT", "5432"),
            }
        }
else:
    db_path = BASE_DIR / "db.sqlite3"
    
    if os.environ.get("VERCEL") == "1":
        import shutil
        tmp_db_path = Path("/tmp/db.sqlite3")
        try:
            if not tmp_db_path.exists() and db_path.exists():
                temp_copy_path = Path(f"/tmp/db.sqlite3.tmp-{os.getpid()}")
                shutil.copy2(db_path, temp_copy_path)
                try:
                    temp_copy_path.rename(tmp_db_path)
                except FileExistsError:
                    temp_copy_path.unlink(missing_ok=True)
        except Exception as e:
            pass
        
        db_path = tmp_db_path

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": db_path,
        }
    }

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
if os.environ.get("VERCEL") == "1":
    MEDIA_ROOT = Path("/tmp/media")
else:
    MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ------------------------------------------------------------------
# DRF / JWT
# ------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Enterprise LMS API",
    "DESCRIPTION": "Complete API documentation for the Enterprise Learning Management System (LMS).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ------------------------------------------------------------------
# CORS — allow the React dev server
# ------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3010",
    "http://127.0.0.1:3010",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


# ------------------------------------------------------------------
# Email Settings — SMTP for production, console for dev
# ------------------------------------------------------------------
if os.environ.get("EMAIL_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ.get("EMAIL_HOST")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@enterprise-lms.com")

# ------------------------------------------------------------------
# Payment gateway keys (set via environment variables in production)
# ------------------------------------------------------------------
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
