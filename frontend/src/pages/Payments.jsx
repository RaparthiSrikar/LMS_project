import ResourcePage from "../components/ResourcePage";

export default function Payments() {
  return (
    <ResourcePage
      title="Payments"
      endpoint="/payments/payments/"
      columns={[
        { key: "course_name", label: "Course" },
        { key: "gateway", label: "Gateway" },
        { key: "total_amount", label: "Total" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "course", label: "Course ID", type: "number", required: true },
        { name: "gateway", label: "Gateway", type: "select", options: [{ value: "stripe", label: "Stripe" }, { value: "razorpay", label: "Razorpay" }], required: true },
        { name: "amount", label: "Amount", type: "number", required: true },
      ]}
    />
  );
}
