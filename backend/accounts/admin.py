from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP, PasswordResetToken


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "role", "is_active_account", "is_email_verified")
    list_filter = ("role", "is_active_account", "is_email_verified")
    fieldsets = UserAdmin.fieldsets + (
        ("LMS Profile", {"fields": ("role", "phone", "profile_picture", "is_active_account", "is_email_verified")}),
    )


admin.site.register(OTP)
admin.site.register(PasswordResetToken)
