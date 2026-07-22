import { useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState("dark");
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [message, setMessage] = useState("");

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setMessage("Security credentials updated successfully.");
      setPwdForm({ current: "", newPassword: "", confirm: "" });
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2>System Settings</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Adjust dashboard themes, update login credentials, and configure email alert notifications.
        </p>
      </div>

      {message && (
        <div style={{ background: "#e6f7ff", border: "1px solid #91d5ff", color: "var(--accent)", padding: 12, borderRadius: 8, marginBottom: 20, textAlign: "center", fontSize: 13 }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        
        {/* Core preferences */}
        <div className="card" style={{ background: "#fff", padding: 24, textAlign: "left" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>General Preferences</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Application Theme</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Toggle dark/light rendering modes.</div>
            </div>
            <select 
              className="form-input" 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{ width: 140, margin: 0 }}
            >
              <option value="dark">Deep Blue (Dark)</option>
              <option value="light">Classic White</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Verify logins via verification code.</div>
            </div>
            <button 
              className="btn secondary" 
              onClick={() => setTfaEnabled(!tfaEnabled)}
              style={{ borderColor: tfaEnabled ? "var(--success)" : "#cbd5e1", color: tfaEnabled ? "var(--success)" : "inherit" }}
            >
              {tfaEnabled ? "✓ Enabled" : "Disabled"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Email Notifications</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Receive email reports for assignment submissions.</div>
            </div>
            <button 
              className="btn secondary" 
              onClick={() => setEmailAlerts(!emailAlerts)}
              style={{ borderColor: emailAlerts ? "var(--success)" : "#cbd5e1", color: emailAlerts ? "var(--success)" : "inherit" }}
            >
              {emailAlerts ? "✓ Subscribed" : "Muted"}
            </button>
          </div>
        </div>

        {/* Change Password Block */}
        <div className="card" style={{ background: "#fff", padding: 24, textAlign: "left" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Update Security Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Current Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={pwdForm.current}
                  onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>New Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Confirm Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
