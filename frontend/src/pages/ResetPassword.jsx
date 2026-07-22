import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await client.post("/auth/reset-password/", {
        token: token,
        new_password: password,
      });
      setSuccess("Your password has been successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (e) {
      setError(e.response?.data?.new_password?.[0] || e.response?.data?.detail || "Invalid or expired reset token.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ width: 400 }}>
        <div className="auth-title">New Password</div>
        <div className="auth-sub">Choose a strong, secure password for your account.</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-text">{error}</div>}
          {success && (
            <div style={{ color: "var(--success)", background: "#e6f7ff", border: "1px solid #91d5ff", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 14, textAlign: "center" }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label>New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary-login" type="submit" style={{ width: "100%", marginTop: 8 }}>
            Update Password
          </button>
        </form>

        <button className="btn-outline-login" onClick={() => navigate("/login")} style={{ marginTop: 12 }}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
