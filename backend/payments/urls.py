from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, PaymentViewSet, InvoiceViewSet, RefundViewSet

router = DefaultRouter()
router.register("coupons", CouponViewSet)
router.register("payments", PaymentViewSet, basename="payment")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("refunds", RefundViewSet, basename="refund")

urlpatterns = router.urls
