import { useState } from "react";

export default function InviteEarn() {
  const referralCode = "LMS_STUDENT_88F3A";
  const referralLink = `https://lms-portal.com/register?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrals = [];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Invite and Earn Rewards</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
        Share the learning platform with your classmates. Get $20 cash bonus credited for every student who enrolls!
      </p>

      {/* Stats row */}
      <div className="card-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Referrals</div>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>$0.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Payouts</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>$0.00</div>
        </div>
      </div>

      {/* Copy link section */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Your Referral Link</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px 0" }}>
          Copy and share this registration URL. The tracking cookie lasts for 30 days.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ fontWeight: 500, background: "#f8f9fc" }}
            value={referralLink} 
            readOnly 
          />
          <button 
            className="btn" 
            style={{ minWidth: 100 }}
            onClick={handleCopy}
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Referrals history list */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Referral History</h3>
        
        <table>
          <thead>
            <tr>
              <th>Friend Name</th>
              <th>Date Joined</th>
              <th>Status</th>
              <th>Your Reward</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
                  No referrals made yet. Share your link above to invite friends!
                </td>
              </tr>
            ) : (
              referrals.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${r.status.startsWith("Enrolled") ? "success" : ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: r.bonus.includes("Pending") ? "var(--text-muted)" : "var(--success)" }}>
                    {r.bonus}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
