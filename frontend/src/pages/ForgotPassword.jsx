import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await client.post("/auth/forgot-password/", { email });
      setSuccess("If that email exists in our system, a password reset link has been printed to the backend console logs.");
      setEmail("");
    } catch (e) {
      setError("Failed to submit request.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ width: 400 }}>
        <div className="auth-title">Reset Password</div>
        <div className="auth-sub">Enter your email and we'll send you a link to reset your password.</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-text">{error}</div>}
          {success && (
            <div style={{ color: "var(--success)", background: "#e6f7ff", border: "1px solid #91d5ff", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 14, textAlign: "center" }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary-login" type="submit" style={{ width: "100%", marginTop: 8 }}>
            Send Reset Link
          </button>
        </form>

        <button className="btn-outline-login" onClick={() => navigate("/login")} style={{ marginTop: 12 }}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
