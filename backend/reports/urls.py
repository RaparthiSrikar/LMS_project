from django.urls import path
from . import views

urlpatterns = [
    path("students/", views.StudentReportView.as_view(), name="report_students"),
    path("attendance/", views.AttendanceReportView.as_view(), name="report_attendance"),
    path("assignments/", views.AssignmentReportView.as_view(), name="report_assignments"),
    path("quizzes/", views.QuizReportView.as_view(), name="report_quizzes"),
    path("trainer-performance/", views.TrainerPerformanceReportView.as_view(), name="report_trainer_performance"),
]
