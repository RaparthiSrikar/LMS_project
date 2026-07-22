from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, VideoProgressViewSet

router = DefaultRouter()
router.register("enrollments", EnrollmentViewSet, basename="enrollment")
router.register("video-progress", VideoProgressViewSet, basename="video-progress")

urlpatterns = router.urls
