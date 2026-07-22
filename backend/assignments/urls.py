from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, SubmissionViewSet

router = DefaultRouter()
router.register("assignments", AssignmentViewSet)
router.register("submissions", SubmissionViewSet, basename="submission")

urlpatterns = router.urls
