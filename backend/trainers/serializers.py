from rest_framework import serializers
from .models import Note, Video, LiveSession, Announcement


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "course", "title", "file", "date", "uploaded_at"]


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "course", "title", "file", "url", "duration_minutes", "date", "uploaded_at"]


class LiveSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = ["id", "course", "title", "meeting_link", "scheduled_at", "duration_minutes", "created_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source="trainer.get_full_name", read_only=True)

    class Meta:
        model = Announcement
        fields = ["id", "course", "trainer", "trainer_name", "title", "message", "published_at"]
        read_only_fields = ["trainer"]
