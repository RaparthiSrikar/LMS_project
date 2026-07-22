from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, VideoViewSet, LiveSessionViewSet, AnnouncementViewSet

router = DefaultRouter()
router.register("notes", NoteViewSet)
router.register("videos", VideoViewSet)
router.register("live-sessions", LiveSessionViewSet)
router.register("announcements", AnnouncementViewSet)

urlpatterns = router.urls
