from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView  # noqa: F401  (re-exported via urls)

from .models import User, OTP, PasswordResetToken
from .permissions import IsAdminOrSuperAdmin
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, OTPVerifySerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """User Registration."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    """Login — returns JWT access + refresh tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            RefreshToken(request.data["refresh"]).blacklist()
        except Exception:
            pass
        return Response({"detail": "Logged out."}, status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    """Current authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SendOTPView(APIView):
    """Request a fresh OTP (email verification or login OTP)."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        purpose = request.data.get("purpose", OTP.Purpose.EMAIL_VERIFICATION)
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "No account with that email."}, status=404)
        otp = OTP.objects.create(user=user, code=OTP.generate_code(), purpose=purpose)
        print(f"[DEV] OTP for {user.email} ({purpose}): {otp.code}")
        return Response({"detail": "OTP sent."})


class VerifyOTPView(APIView):
    """Verify Email / OTP-based login."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User.objects.filter(email=data["email"]).first()
        if not user:
            return Response({"detail": "Invalid email."}, status=404)
        otp = OTP.objects.filter(
            user=user, code=data["code"], purpose=data["purpose"], is_used=False
        ).order_by("-created_at").first()
        if not otp or not otp.is_valid():
            return Response({"detail": "Invalid or expired OTP."}, status=400)
        otp.is_used = True
        otp.save()
        if data["purpose"] == OTP.Purpose.EMAIL_VERIFICATION:
            user.is_email_verified = True
            user.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "detail": "OTP verified.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class ForgotPasswordView(APIView):
    """Sends a password-reset token/link to the user's email."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data["email"]).first()
        if user:
            reset = PasswordResetToken.objects.create(user=user, expires_at=None)
            print(f"[DEV] Password reset link for {user.email}: /reset-password?token={reset.token}")
        # Always return 200 to avoid leaking which emails exist
        return Response({"detail": "If that email exists, a reset link has been sent."})


class ResetPasswordView(APIView):
    """Consumes a reset token and sets a new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = PasswordResetToken.objects.filter(token=serializer.validated_data["token"]).first()
        if not token or not token.is_valid():
            return Response({"detail": "Invalid or expired token."}, status=400)
        user = token.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        token.is_used = True
        token.save()
        return Response({"detail": "Password has been reset."})


class ChangePasswordView(APIView):
    """Authenticated user changes their own password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"detail": "Old password is incorrect."}, status=400)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password changed."})


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Module 2 — User Management (Admin only).
    Create / edit / delete / activate / reset-password / upload-profile-picture.
    """
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    filterset_fields = ["role", "is_active_account"]
    search_fields = ["email", "username", "first_name", "last_name"]

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active_account = True
        user.save()
        return Response({"detail": "User activated."})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active_account = False
        user.save()
        return Response({"detail": "User deactivated."})

    @action(detail=True, methods=["post"], url_path="reset-password")
    def admin_reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get("new_password", "Temp@1234")
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password reset by admin."})

    @action(detail=True, methods=["post"], url_path="upload-profile-picture")
    def upload_profile_picture(self, request, pk=None):
        user = self.get_object()
        file = request.FILES.get("profile_picture")
        if not file:
            return Response({"detail": "No file provided."}, status=400)
        user.profile_picture = file
        user.save()
        return Response(UserSerializer(user).data)
