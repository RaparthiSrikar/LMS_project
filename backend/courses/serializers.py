from rest_framework import serializers
from .models import Category, Tag, Course


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class CourseSerializer(serializers.ModelSerializer):
    final_price = serializers.SerializerMethodField()
    trainer_name = serializers.CharField(source="trainer.get_full_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "name", "category", "category_name", "level", "duration_weeks", "description",
            "price", "discount_percent", "final_price", "thumbnail", "banner", "video_preview",
            "trainer", "trainer_name", "tags", "is_published", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_final_price(self, obj):
        return obj.final_price()
