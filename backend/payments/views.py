from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Coupon, Payment, Invoice, Refund
from .serializers import CouponSerializer, PaymentSerializer, InvoiceSerializer, RefundSerializer
from accounts.permissions import IsAdminOrSuperAdmin


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def validate(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"detail": "Coupon code is required."}, status=400)
        try:
            coupon = Coupon.objects.get(code__iexact=code, active=True, valid_until__gt=timezone.now())
            if coupon.used_count >= coupon.max_uses:
                return Response({"detail": "Coupon usage limit reached."}, status=400)
            return Response({
                "id": coupon.id,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
            })
        except Coupon.DoesNotExist:
            return Response({"detail": "Invalid or expired coupon code."}, status=400)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    Purchase Course. In production this integrates with the real
    Stripe/Razorpay SDKs server-side using STRIPE_SECRET_KEY / RAZORPAY_KEY_*
    from settings; here we record the transaction and auto-generate an invoice.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "gateway", "course"]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.all().order_by("-created_at")
        if user.role == "student":
            return qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        payment = serializer.save(student=self.request.user, status=Payment.Status.SUCCESS)
        Invoice.objects.create(payment=payment)
        
        # Auto-enroll student upon successful payment
        from students.models import Enrollment
        Enrollment.objects.get_or_create(
            student=self.request.user,
            course=payment.course
        )


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.all()
        if user.role == "student":
            return qs.filter(payment__student=user)
        return qs


class RefundViewSet(viewsets.ModelViewSet):
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Refund.objects.all().order_by("-requested_at")
        if user.role == "student":
            return qs.filter(payment__student=user)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrSuperAdmin])
    def approve(self, request, pk=None):
        refund = self.get_object()
        refund.status = Refund.Status.APPROVED
        refund.processed_at = timezone.now()
        refund.save()
        refund.payment.status = "refunded"
        refund.payment.save()
        return Response({"detail": "Refund approved."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrSuperAdmin])
    def reject(self, request, pk=None):
        refund = self.get_object()
        refund.status = Refund.Status.REJECTED
        refund.processed_at = timezone.now()
        refund.save()
        return Response({"detail": "Refund rejected."})
