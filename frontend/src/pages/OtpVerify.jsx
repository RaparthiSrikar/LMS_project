import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await client.post("/auth/otp/send/", {
        email,
        purpose: "email_verification",
      });
      setSuccess("Verification code resent successfully!");
      setCooldown(30); // 30-second cooldown
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await client.post("/auth/verify-otp/", {
        email,
        code,
        purpose: "email_verification",
      });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      await refetch(); // loads user context
      setSuccess("Email verified successfully! Logging you in...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e) {
      setError(e.response?.data?.detail || "Invalid or expired OTP code.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ width: 400 }}>
        <div className="auth-title">Verify OTP</div>
        <div className="auth-sub">Enter the code sent to your email to verify your account.</div>

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

          <div className="form-group">
            <label>6-Digit Verification Code</label>
            <input
              className="form-input"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{ letterSpacing: 4, textAlign: "center", fontSize: 18, fontWeight: 600 }}
            />
          </div>

          <button className="btn-primary-login" type="submit" style={{ width: "100%", marginTop: 8 }}>
            Verify Account
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            style={{
              background: "none",
              border: "none",
              color: cooldown > 0 ? "#8c8c8c" : "#1b75ff",
              cursor: cooldown > 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              padding: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
              textDecoration: cooldown > 0 ? "none" : "underline",
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>

        <button className="btn-outline-login" onClick={() => navigate("/login")} style={{ marginTop: 16 }}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
