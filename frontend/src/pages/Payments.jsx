import ResourcePage from "../components/ResourcePage";
import client from "../api/client";

export default function Payments() {
  const handleRequestRefund = async (paymentId, reload) => {
    const reason = prompt("Please enter the reason for your refund request:");
    if (!reason || !reason.trim()) return;

    try {
      await client.post("/payments/refunds/", {
        payment: paymentId,
        reason: reason.trim(),
      });
      alert("Refund requested successfully!");
      reload();
    } catch (e) {
      alert(e.response?.data?.detail ?? "Failed to request refund.");
    }
  };

  const renderActions = (row, reload) => {
    return (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
        {row.invoice_pdf && (
          <a
            href={row.invoice_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="btn secondary"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            📄 Invoice
          </a>
        )}

        {row.status === "success" && (
          <>
            {row.refund_status ? (
              <span 
                className={`badge ${
                  row.refund_status === "approved" || row.refund_status === "completed" 
                    ? "success" 
                    : row.refund_status === "rejected" 
                    ? "danger" 
                    : ""
                }`}
                style={{ fontSize: 11, padding: "4px 8px", textTransform: "capitalize" }}
              >
                Refund: {row.refund_status}
              </span>
            ) : (
              <button
                type="button"
                className="btn danger"
                onClick={() => handleRequestRefund(row.id, reload)}
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                Request Refund
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <ResourcePage
      title="Payments"
      endpoint="/payments/payments/"
      columns={[
        { key: "course_name", label: "Course" },
        { key: "gateway", label: "Gateway", render: (row) => <span style={{ textTransform: "capitalize" }}>{row.gateway}</span> },
        { key: "total_amount", label: "Total", render: (row) => `$${Number(row.total_amount).toFixed(2)}` },
        { key: "status", label: "Status", render: (row) => (
          <span className={`badge ${row.status === "success" ? "success" : row.status === "failed" ? "danger" : ""}`}>
            {row.status}
          </span>
        ) },
      ]}
      fields={[
        { name: "course", label: "Course ID", type: "number", required: true },
        { name: "gateway", label: "Gateway", type: "select", options: [{ value: "stripe", label: "Stripe" }, { value: "razorpay", label: "Razorpay" }], required: true },
        { name: "amount", label: "Amount", type: "number", required: true },
      ]}
      extraAction={renderActions}
    />
  );
}
