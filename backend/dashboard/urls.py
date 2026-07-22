from django.urls import path
from .views import AdminDashboardView, TrainerDashboardView

urlpatterns = [
    path("admin/", AdminDashboardView.as_view(), name="admin_dashboard"),
    path("trainer/", TrainerDashboardView.as_view(), name="trainer_dashboard"),
]
