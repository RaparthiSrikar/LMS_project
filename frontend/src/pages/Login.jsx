import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (e) {
      const resp = e.response?.data;
      if (typeof resp === "string") {
        setError(resp);
      } else if (resp?.non_field_errors?.[0]) {
        setError(resp.non_field_errors[0]);
      } else if (resp?.detail) {
        setError(resp.detail);
      } else if (resp?.email?.[0]) {
        setError(resp.email[0]);
      } else if (resp?.password?.[0]) {
        setError(resp.password[0]);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-split">
        {/* Left Column - Character Illustration */}
        <div className="auth-left-illustration">
          <img src="/login_character.png" alt="Sign In Illustration" />
        </div>

        {/* Right Column - Sign In Form */}
        <div className="auth-right-form">
          <div className="auth-title">Sign In</div>
          <div className="auth-sub">Unlock your world.</div>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="error-text">{error}</div>}
            
            <div className="form-group">
              <label>
                <span className="required-asterisk">*</span>Email or Username
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <span className="required-asterisk">*</span>Password
              </label>
              <div className="password-input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                      style={{ width: 20, height: 20 }}
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
                      style={{ width: 20, height: 20 }}
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
            
            <button className="btn-primary-login" type="submit">
              Sign In
            </button>
          </form>
          
          <button className="btn-outline-login" onClick={() => navigate("/register")}>
            Create an account
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            <span style={{ color: "#1b75ff", cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
