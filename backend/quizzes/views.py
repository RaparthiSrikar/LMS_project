from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quiz, Question, QuizAttempt, Answer
from .serializers import QuizSerializer, QuestionSerializer, QuizAttemptSerializer, AnswerSerializer


class IsTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("trainer", "admin", "super_admin")
        )


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().order_by("-created_at")
    serializer_class = QuizSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]

    @action(detail=True, methods=["get"], url_path="leaderboard")
    def leaderboard(self, request, pk=None):
        quiz = self.get_object()
        attempts = quiz.attempts.filter(submitted_at__isnull=False).order_by("-score")[:20]
        return Response(QuizAttemptSerializer(attempts, many=True).data)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["quiz"]


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """Student takes a timed quiz; auto-evaluation with negative marking on submit."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["quiz"]

    def get_queryset(self):
        user = self.request.user
        qs = QuizAttempt.objects.all().order_by("-started_at")
        if user.role == "student":
            return qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Auto-evaluate MCQ / True-False answers with negative marking. Coding Qs left for manual review."""
        attempt = self.get_object()
        quiz = attempt.quiz
        total_score = 0
        for answer in attempt.answers.select_related("question", "selected_choice"):
            q = answer.question
            if q.question_type == "coding":
                continue  # manual grading
            correct = bool(answer.selected_choice and answer.selected_choice.is_correct)
            answer.is_correct = correct
            answer.save()
            if correct:
                total_score += q.marks
            else:
                total_score -= float(quiz.negative_marking)
        attempt.score = max(total_score, 0)
        attempt.submitted_at = timezone.now()
        attempt.is_auto_evaluated = True
        attempt.save()
        return Response(QuizAttemptSerializer(attempt).data)


class AnswerViewSet(viewsets.ModelViewSet):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["attempt"]

    def get_queryset(self):
        user = self.request.user
        qs = Answer.objects.all()
        if user.role == "student":
            return qs.filter(attempt__student=user)
        return qs
