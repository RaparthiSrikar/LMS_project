import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught LMS Application Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "sans-serif",
          padding: 20
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 36,
            maxWidth: 480,
            width: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: 22 }}>Application Error Encountered</h2>
            <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, margin: "12px 0 20px 0", textAlign: "left", fontSize: 12, color: "#b91c1c", fontFamily: "monospace", overflowX: "auto", maxHeight: 150 }}>
              <strong>{this.state.error?.toString()}</strong>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, whiteSpace: "pre-wrap" }}>
                {this.state.error?.stack?.slice(0, 400)}
              </div>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, margin: "0 0 24px 0" }}>
              An unexpected render error occurred in the browser workspace. You can reload the page or reset session credentials.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: "#e2e8f0",
                  color: "#1e293b",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                🔄 Reload Page
              </button>
              <button 
                onClick={this.handleReset}
                style={{
                  background: "#e8963c",
                  color: "#12193a",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                🔑 Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
