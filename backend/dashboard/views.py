from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from courses.models import Course
from students.models import Enrollment
from assignments.models import Submission, Assignment
from payments.models import Payment
from trainers.models import LiveSession


class AdminDashboardView(APIView):
    """Module 9 — Admin Dashboard cards."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = timezone.now() - timedelta(days=30)

        total_revenue = sum(
            p.total_amount for p in Payment.objects.filter(status="success")
        )
        completed = Enrollment.objects.filter(is_completed=True).count()
        total_enrollments = Enrollment.objects.count()

        data = {
            "total_students": User.objects.filter(role="student").count(),
            "total_trainers": User.objects.filter(role="trainer").count(),
            "total_revenue": float(total_revenue),
            "active_courses": Course.objects.count(),
            "pending_assignments": Assignment.objects.filter(due_date__gte=timezone.now()).count(),
            "student_growth_30d": User.objects.filter(
                role="student", created_at__gte=thirty_days_ago
            ).count(),
            "course_completion_rate": round(
                (completed / total_enrollments * 100) if total_enrollments else 0.0, 1
            ),
            "daily_logins": User.objects.filter(last_login__date=today).count(),
            "active_users": User.objects.filter(is_active_account=True).count(),
        }
        return Response(data)




class TrainerDashboardView(APIView):
    """Module 9 — Trainer Dashboard metrics and lists."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "trainer" and user.role != "super_admin" and user.role != "admin":
            return Response({"detail": "Only trainers have a personalized dashboard."}, status=403)

        courses_taught = Course.objects.filter(trainer=user)
        total_courses = courses_taught.count()

        active_students = Enrollment.objects.filter(course__in=courses_taught).values("student").distinct().count()

        my_assignments = Assignment.objects.filter(course__in=courses_taught)
        pending_submissions_count = Submission.objects.filter(assignment__in=my_assignments, evaluated_at__isnull=True).count()

        upcoming_live_count = LiveSession.objects.filter(course__in=courses_taught, scheduled_at__gte=timezone.now()).count()

        live_sessions_list = [{
            "id": ls.id,
            "title": ls.title,
            "course_name": ls.course.name,
            "scheduled_at": ls.scheduled_at.isoformat(),
            "meeting_link": ls.meeting_link
        } for ls in LiveSession.objects.filter(course__in=courses_taught).order_by("scheduled_at")[:5]]

        pending_eval_list = [{
            "id": sub.id,
            "student_name": sub.student.get_full_name() or sub.student.username,
            "assignment_title": sub.assignment.title,
            "course_name": sub.assignment.course.name,
            "submitted_at": sub.submitted_at.isoformat()
        } for sub in Submission.objects.filter(assignment__in=my_assignments, evaluated_at__isnull=True).order_by("-submitted_at")[:5]]

        data = {
            "total_courses": total_courses,
            "active_students": active_students,
            "pending_submissions": pending_submissions_count,
            "upcoming_live_sessions": upcoming_live_count,
            "live_sessions": live_sessions_list,
            "pending_evaluations": pending_eval_list
        }
        return Response(data)
