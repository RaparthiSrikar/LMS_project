from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    """Module 5 — Course Management."""

    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="courses")
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    duration_weeks = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    thumbnail = models.ImageField(upload_to="course_thumbnails/", blank=True, null=True)
    banner = models.ImageField(upload_to="course_banners/", blank=True, null=True)
    video_preview = models.FileField(upload_to="course_previews/", blank=True, null=True)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="courses_taught"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="courses")
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def final_price(self):
        return round(float(self.price) * (1 - float(self.discount_percent) / 100), 2)

    def __str__(self):
        return self.name
