from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer


class IsTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("trainer", "admin", "super_admin")
        )


class AssignmentViewSet(viewsets.ModelViewSet):
    """Trainer: create assignment, upload files, set due date, assign marks."""
    queryset = Assignment.objects.all().order_by("-created_at")
    serializer_class = AssignmentSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]

    def perform_create(self, serializer):
        serializer.save(trainer=self.request.user)


class SubmissionViewSet(viewsets.ModelViewSet):
    """Student: submit / resubmit. Trainer: evaluate, add remarks, publish result."""
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["assignment", "status"]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.all().order_by("-submitted_at")
        if user.role == "student":
            return qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, status=Submission.Status.SUBMITTED)

    def perform_update(self, serializer):
        # resubmission by the student
        if self.request.user.role == "student":
            serializer.save(status=Submission.Status.RESUBMITTED)
        else:
            serializer.save()

    @action(detail=True, methods=["post"])
    def evaluate(self, request, pk=None):
        submission = self.get_object()
        submission.marks_awarded = request.data.get("marks_awarded")
        submission.remarks = request.data.get("remarks", "")
        submission.status = Submission.Status.EVALUATED
        submission.evaluated_at = timezone.now()
        submission.save()
        return Response(SubmissionSerializer(submission).data)

    @action(detail=True, methods=["post"], url_path="publish-result")
    def publish_result(self, request, pk=None):
        submission = self.get_object()
        submission.is_result_published = True
        submission.save()
        return Response({"detail": "Result published."})
