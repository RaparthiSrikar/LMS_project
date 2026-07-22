from django.conf import settings
from django.db import models
from courses.models import Course


class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="assignments")
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="assignments/", blank=True, null=True)
    due_date = models.DateTimeField()
    max_marks = models.PositiveIntegerField(default=100)
    date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Submission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        RESUBMITTED = "resubmitted", "Resubmitted"
        EVALUATED = "evaluated", "Evaluated"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="submissions")
    document = models.FileField(upload_to="submissions/")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    marks_awarded = models.PositiveIntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    is_result_published = models.BooleanField(default=False)

    class Meta:
        unique_together = ("assignment", "student")
