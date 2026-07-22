from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TagViewSet, CourseViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("tags", TagViewSet)
router.register("courses", CourseViewSet)

urlpatterns = router.urls
