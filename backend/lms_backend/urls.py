from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "name": "Enterprise LMS API",
        "status": "running",
        "documentation": "/api/schema/swagger-ui/",
        "admin": "/admin/",
        "endpoints": {
            "auth": "/api/auth/",
            "courses": "/api/courses/",
            "trainers": "/api/trainers/",
            "students": "/api/students/",
            "payments": "/api/payments/",
            "assignments": "/api/assignments/",
            "quizzes": "/api/quizzes/",
            "dashboard": "/api/dashboard/",
            "reports": "/api/reports/",
        }
    })

urlpatterns = [
    path("", api_root_view, name="api-root"),
    # Swagger & ReDoc API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/trainers/", include("trainers.urls")),
    path("api/students/", include("students.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/assignments/", include("assignments.urls")),
    path("api/quizzes/", include("quizzes.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/reports/", include("reports.urls")),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
