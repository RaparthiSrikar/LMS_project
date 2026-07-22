import { useState } from "react";

const SNIPPETS_DATA = [
  {
    id: 1,
    title: "Axios API client with interceptors",
    lang: "JS",
    code: `import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default client;`
  },
  {
    id: 2,
    title: "Django Custom JWT Serializer Claims",
    lang: "Python",
    code: `from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        return token`
  },
  {
    id: 3,
    title: "CSS Glassmorphism Card Style",
    lang: "CSS",
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}`
  },
  {
    id: 4,
    title: "SQL Window Function (Cumulative Sum)",
    lang: "SQL",
    code: `SELECT 
  order_date, 
  amount,
  SUM(amount) OVER (
    ORDER BY order_date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_sales
FROM sales_records;`
  }
];

export default function CodeSnippets() {
  const [activeLang, setActiveLang] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSnippets = activeLang === "all"
    ? SNIPPETS_DATA
    : SNIPPETS_DATA.filter(s => s.lang.toLowerCase() === activeLang.toLowerCase());

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Code Snippets Repository</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Quick-access templates and utility functions ready to drop into your code.
          </p>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="tabs">
        {["all", "JS", "Python", "CSS", "SQL"].map(l => (
          <div 
            key={l} 
            className={`tab ${activeLang === l ? "active" : ""}`}
            onClick={() => setActiveLang(l)}
          >
            {l === "all" ? "All Languages" : l}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {filteredSnippets.map(snippet => (
          <div key={snippet.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{snippet.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge" style={{ fontSize: 10, background: "#f1f3f9" }}>{snippet.lang}</span>
                <button 
                  className="btn secondary" 
                  style={{ padding: "4px 10px", fontSize: 11, minWidth: 70, textAlign: "center" }}
                  onClick={() => handleCopy(snippet.id, snippet.code)}
                >
                  {copiedId === snippet.id ? "Copied! ✓" : "Copy"}
                </button>
              </div>
            </div>

            <pre 
              style={{ 
                margin: 0, 
                padding: 16, 
                background: "#1e1e2e", 
                color: "#cdd6f4", 
                borderRadius: 8, 
                fontFamily: "Courier New, Courier, monospace", 
                fontSize: 13, 
                overflowX: "auto",
                lineHeight: 1.4
              }}
            >
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
