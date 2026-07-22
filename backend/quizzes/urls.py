from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, QuizAttemptViewSet, AnswerViewSet

router = DefaultRouter()
router.register("quizzes", QuizViewSet)
router.register("questions", QuestionViewSet)
router.register("attempts", QuizAttemptViewSet, basename="attempt")
router.register("answers", AnswerViewSet, basename="answer")

urlpatterns = router.urls
