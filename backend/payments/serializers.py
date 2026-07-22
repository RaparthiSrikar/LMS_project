from rest_framework import serializers
from .models import Coupon, Payment, Invoice, Refund

GST_RATE = 0.18  # 18% GST, configurable


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "student", "course", "course_name", "coupon", "gateway", "gateway_reference",
            "amount", "gst_amount", "total_amount", "status", "created_at",
        ]
        read_only_fields = ["student", "gst_amount", "total_amount", "status", "created_at"]

    def create(self, validated_data):
        amount = validated_data["amount"]
        coupon = validated_data.get("coupon")
        if coupon and coupon.active:
            amount = float(amount) * (1 - float(coupon.discount_percent) / 100)
            coupon.used_count += 1
            coupon.save()
        gst = round(float(amount) * GST_RATE, 2)
        validated_data["gst_amount"] = gst
        validated_data["total_amount"] = round(float(amount) + gst, 2)
        return super().create(validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["id", "payment", "invoice_number", "issued_at", "pdf_file"]


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ["id", "payment", "reason", "status", "requested_at", "processed_at"]
        read_only_fields = ["status", "processed_at"]
