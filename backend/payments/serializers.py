from rest_framework import serializers
from .models import Coupon, Payment, Invoice, Refund

GST_RATE = 0.18  # 18% GST, configurable


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)
    invoice_number = serializers.SerializerMethodField()
    invoice_pdf = serializers.SerializerMethodField()
    refund_status = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "student", "course", "course_name", "coupon", "gateway", "gateway_reference",
            "amount", "gst_amount", "total_amount", "status", "created_at",
            "invoice_number", "invoice_pdf", "refund_status",
        ]
        read_only_fields = ["student", "gst_amount", "total_amount", "status", "created_at"]

    def get_invoice_number(self, obj):
        try:
            return obj.invoice.invoice_number
        except Exception:
            return None

    def get_invoice_pdf(self, obj):
        try:
            if obj.invoice and obj.invoice.pdf_file:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.invoice.pdf_file.url)
                return obj.invoice.pdf_file.url
        except Exception:
            pass
        return None

    def get_refund_status(self, obj):
        latest_refund = obj.refunds.order_by("-created_at" if hasattr(Refund, 'created_at') else "-requested_at").first()
        return latest_refund.status if latest_refund else None

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
