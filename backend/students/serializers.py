from rest_framework import serializers
from .models import Enrollment, VideoProgress


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id", "student", "student_name", "course", "course_name",
            "enrolled_at", "progress_percent", "is_completed", "is_paused",
        ]
        read_only_fields = ["student", "enrolled_at"]


class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ["id", "enrollment", "video", "watched", "watched_at"]
