from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register("users", views.UserManagementViewSet, basename="user-management")

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("otp/send/", views.SendOTPView.as_view(), name="send_otp"),
    path("otp/verify/", views.VerifyOTPView.as_view(), name="verify_otp"),
    path("password/forgot/", views.ForgotPasswordView.as_view(), name="forgot_password"),
    path("password/reset/", views.ResetPasswordView.as_view(), name="reset_password"),
    path("password/change/", views.ChangePasswordView.as_view(), name="change_password"),
    path("", include(router.urls)),
]
