from django.conf import settings
from django.db import models
from courses.models import Course


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    time_limit_minutes = models.PositiveIntegerField(default=30)
    negative_marking = models.DecimalField(max_digits=4, decimal_places=2, default=0)  # marks deducted per wrong answer
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    class QType(models.TextChoices):
        MCQ = "mcq", "MCQ"
        TRUE_FALSE = "true_false", "True/False"
        CODING = "coding", "Coding"

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QType.choices, default=QType.MCQ)
    marks = models.PositiveIntegerField(default=1)
    starter_code = models.TextField(blank=True)  # for coding questions

    def __str__(self):
        return self.text[:60]


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quiz_attempts")
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_auto_evaluated = models.BooleanField(default=False)


class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)
    code_answer = models.TextField(blank=True)  # for coding questions
    is_correct = models.BooleanField(null=True)
