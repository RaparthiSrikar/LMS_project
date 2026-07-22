from django.conf import settings
from django.db import models
from courses.models import Course


class Enrollment(models.Model):
    """Module 4 — Student enrolls in a course and progress is tracked."""

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress_percent = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} -> {self.course} ({self.progress_percent}%)"


class VideoProgress(models.Model):
    """Tracks whether a student has watched a specific video."""

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="video_progress")
    video = models.ForeignKey("trainers.Video", on_delete=models.CASCADE)
    watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("enrollment", "video")
