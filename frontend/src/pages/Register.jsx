import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleVerifyEmail = async () => {
    if (!form.email) {
      setError("Please enter an email address first.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await client.post("/auth/otp/send/", { email: form.email, purpose: "email_verification" });
      setSuccess("Verification code sent! Redirecting to OTP verification screen...");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: form.email } });
      }, 1500);
    } catch (e) {
      if (e.response?.status === 404) {
        setSuccess("Email is available! Please fill out the registration form below and click 'Register'.");
      } else {
        setError(e.response?.data?.detail || "Could not send verification code.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await client.post("/auth/register/", form);
      setSuccess("Registration details submitted! Redirecting to verify your email address...");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: form.email } });
      }, 1500);
    } catch (e) {
      setError(
        e.response?.data 
          ? Object.entries(e.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
          : "Registration failed."
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-split" style={{ height: "auto", minHeight: 560, alignSelf: "center" }}>
        {/* Left Column - Character Illustration */}
        <div className="auth-left-illustration" style={{ flex: "1.1" }}>
          <img src="/login_character.png" alt="Sign Up Illustration" />
        </div>

        {/* Right Column - Sign Up Form */}
        <div className="auth-right-form" style={{ flex: "0.9", padding: "16px 24px" }}>
          <div className="auth-title">Create Account</div>
          <div className="auth-sub">Join Enterprise LMS today.</div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-text" style={{ fontSize: 12, padding: "6px 10px" }}>{error}</div>}
            {success && (
              <div style={{ color: "var(--success)", background: "#e6f7ff", border: "1px solid #91d5ff", padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 12, textAlign: "center" }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label>
                <span className="required-asterisk">*</span>Username
              </label>
              <input
                className="form-input"
                placeholder="Enter a username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <span className="required-asterisk">*</span>Email Address
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn secondary"
                  style={{ whiteSpace: "nowrap", padding: "8px 12px", fontSize: 13 }}
                  onClick={handleVerifyEmail}
                  title="Verify email code if you already created an account"
                >
                  Verify
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="form-input"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="form-input"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <span className="required-asterisk">*</span>Password
              </label>
              <div className="password-input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ width: 18, height: 18 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ width: 18, height: 18 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <select className="form-input" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <button className="btn-primary-login" type="submit" style={{ marginTop: 4 }}>
              Register
            </button>
          </form>

          <button className="btn-outline-login" style={{ marginTop: 8 }} onClick={() => navigate("/login")}>
            Sign In to Existing Account
          </button>
        </div>
      </div>
    </div>
  );
}

