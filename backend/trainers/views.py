from rest_framework import viewsets, permissions
from .models import Note, Video, LiveSession, Announcement
from .serializers import NoteSerializer, VideoSerializer, LiveSessionSerializer, AnnouncementSerializer


class IsTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("trainer", "admin", "super_admin")
        )


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by("-uploaded_at")
    serializer_class = NoteSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by("-uploaded_at")
    serializer_class = VideoSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]


class LiveSessionViewSet(viewsets.ModelViewSet):
    queryset = LiveSession.objects.all().order_by("scheduled_at")
    serializer_class = LiveSessionSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by("-published_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [IsTrainerOrAdmin]
    filterset_fields = ["course"]

    def perform_create(self, serializer):
        serializer.save(trainer=self.request.user)
