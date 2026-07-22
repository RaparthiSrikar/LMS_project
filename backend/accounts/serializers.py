from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTP, PasswordResetToken


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "role", "phone",
            "profile_picture", "is_active_account", "is_email_verified", "created_at",
        ]
        read_only_fields = ["id", "is_email_verified", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name", "role", "phone"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_email_verified = False
        user.save()
        # issue an email-verification OTP
        otp = OTP.objects.create(user=user, code=OTP.generate_code(), purpose=OTP.Purpose.EMAIL_VERIFICATION)
        print(f"[DEV] Email verification OTP for {user.email}: {otp.code}")
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()  # Accepts either email or username
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login_input = attrs.get("email", "").strip()
        password = attrs.get("password", "")

        user = User.objects.filter(
            Q(email__iexact=login_input) | Q(username__iexact=login_input)
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid email/username or password.")
        if not user.is_email_verified:
            raise serializers.ValidationError("Please verify your email address before logging in.")
        if not user.is_active_account:
            raise serializers.ValidationError("This account has been deactivated.")
        
        refresh = RefreshToken.for_user(user)
        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }



class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=OTP.Purpose.choices)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(validators=[validate_password])


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
