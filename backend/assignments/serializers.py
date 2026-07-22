from rest_framework import serializers
from .models import Assignment, Submission


class AssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)
    trainer_name = serializers.CharField(source="trainer.username", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_name", "trainer", "trainer_name", "title",
            "description", "file", "due_date", "max_marks", "date", "created_at"
        ]
        read_only_fields = ["trainer"]


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    max_marks = serializers.IntegerField(source="assignment.max_marks", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "assignment_title", "student", "student_name", "document", "status",
            "marks_awarded", "max_marks", "remarks", "submitted_at", "evaluated_at", "is_result_published",
        ]
        read_only_fields = ["student", "submitted_at"]

    def get_student_name(self, obj):
        if obj.student:
            full = f"{obj.student.first_name} {obj.student.last_name}".strip()
            return full if full else obj.student.username
        return "Unknown Student"

