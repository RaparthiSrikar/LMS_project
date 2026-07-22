import io
from django.http import FileResponse, HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import openpyxl

from students.models import Enrollment
from assignments.models import Submission
from quizzes.models import QuizAttempt
from accounts.models import User


def _pdf_response(filename, title, rows, headers):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 50
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, title)
    y -= 30
    p.setFont("Helvetica-Bold", 9)
    p.drawString(50, y, " | ".join(headers))
    y -= 15
    p.setFont("Helvetica", 9)
    for row in rows:
        if y < 50:
            p.showPage()
            y = height - 50
        p.drawString(50, y, " | ".join(str(v) for v in row))
        y -= 15
    p.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=filename)


def _excel_response(filename, title, rows, headers):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = title[:31]
    ws.append(headers)
    for row in rows:
        ws.append(row)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    response = HttpResponse(
        buffer.read(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


class BaseReportView(APIView):
    permission_classes = [IsAuthenticated]
    title = "Report"
    headers = []

    def get_rows(self):
        raise NotImplementedError

    def get(self, request):
        fmt = request.query_params.get("format", "pdf")
        rows = self.get_rows()
        filename_base = self.title.lower().replace(" ", "_")
        if fmt == "excel":
            return _excel_response(f"{filename_base}.xlsx", self.title, rows, self.headers)
        return _pdf_response(f"{filename_base}.pdf", self.title, rows, self.headers)


class StudentReportView(BaseReportView):
    title = "Student Report"
    headers = ["Email", "Name", "Active", "Email Verified"]

    def get_rows(self):
        return [
            [u.email, u.get_full_name(), u.is_active_account, u.is_email_verified]
            for u in User.objects.filter(role="student")
        ]


class AttendanceReportView(BaseReportView):
    """Approximated via enrollment/progress data (attendance system not modeled separately)."""
    title = "Attendance Report"
    headers = ["Student", "Course", "Progress %", "Completed"]

    def get_rows(self):
        return [
            [e.student.email, e.course.name, e.progress_percent, e.is_completed]
            for e in Enrollment.objects.select_related("student", "course")
        ]


class AssignmentReportView(BaseReportView):
    title = "Assignment Report"
    headers = ["Student", "Assignment", "Status", "Marks"]

    def get_rows(self):
        return [
            [s.student.email, s.assignment.title, s.status, s.marks_awarded]
            for s in Submission.objects.select_related("student", "assignment")
        ]


class QuizReportView(BaseReportView):
    title = "Quiz Report"
    headers = ["Student", "Quiz", "Score", "Submitted At"]

    def get_rows(self):
        return [
            [a.student.email, a.quiz.title, float(a.score), a.submitted_at]
            for a in QuizAttempt.objects.select_related("student", "quiz")
        ]


class TrainerPerformanceReportView(BaseReportView):
    title = "Trainer Performance"
    headers = ["Trainer", "Courses Taught", "Total Students Enrolled"]

    def get_rows(self):
        from courses.models import Course
        rows = []
        for trainer in User.objects.filter(role="trainer"):
            courses = Course.objects.filter(trainer=trainer)
            student_count = Enrollment.objects.filter(course__in=courses).count()
            rows.append([trainer.email, courses.count(), student_count])
        return rows
