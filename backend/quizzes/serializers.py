from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class ChoiceStudentSerializer(serializers.ModelSerializer):
    """Hides the correct answer from students taking the quiz."""
    class Meta:
        model = Choice
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ["id", "quiz", "text", "question_type", "marks", "starter_code", "choices"]

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", [])
        question = Question.objects.create(**validated_data)
        for c in choices_data:
            Choice.objects.create(question=question, **c)
        return question


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id", "course", "title", "time_limit_minutes", "negative_marking",
            "created_at", "questions", "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "attempt", "question", "selected_choice", "code_answer", "is_correct"]
        read_only_fields = ["is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id", "quiz", "student", "student_name", "started_at",
            "submitted_at", "score", "is_auto_evaluated", "answers",
        ]
        read_only_fields = ["student", "started_at", "score", "is_auto_evaluated"]
