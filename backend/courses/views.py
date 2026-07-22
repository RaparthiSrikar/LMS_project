from rest_framework import viewsets, permissions
from .models import Category, Tag, Course
from .serializers import CategorySerializer, TagSerializer, CourseSerializer


class IsTrainerOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("trainer", "admin", "super_admin")
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsTrainerOrAdminOrReadOnly]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsTrainerOrAdminOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    """Module 5 — Course Management (create/update/delete restricted to trainer/admin)."""
    queryset = Course.objects.all().order_by("-created_at")
    serializer_class = CourseSerializer
    permission_classes = [IsTrainerOrAdminOrReadOnly]
    filterset_fields = ["category", "level", "trainer", "is_published"]
    search_fields = ["name", "description"]

    def perform_create(self, serializer):
        if self.request.user.role == "trainer":
            serializer.save(trainer=self.request.user)
        else:
            serializer.save()
