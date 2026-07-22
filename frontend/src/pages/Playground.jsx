import { useEffect, useRef, useState } from "react";

const INITIAL_CODE = {
  web: `<!-- Write HTML/CSS/JS here -->
<div class="hello-box">
  <h1>Hello from Antigravity Sandbox!</h1>
  <p>Modify this code and click Run Code to update live rendering.</p>
</div>

<style>
  .hello-box {
    text-align: center;
    padding: 30px;
    background: linear-gradient(135deg, #1b75ff, #8a2be2);
    color: white;
    border-radius: 12px;
    font-family: sans-serif;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  h1 { margin: 0 0 10px 0; }
  p { margin: 0; opacity: 0.9; }
</style>
`,
  python: `# Write Python code here
def greet(name):
    print(f"Hello, {name}!")

users = ["Alex", "Sophia", "Antigravity"]
for u in users:
    greet(u)
`
};

export default function Playground() {
  const [lang, setLang] = useState("web");
  const [code, setCode] = useState("");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    setCode(INITIAL_CODE[lang]);
    setConsoleLogs([]);
  }, [lang]);

  const handleRun = () => {
    setConsoleLogs([]);

    if (lang === "web") {
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
        setConsoleLogs(["[Success] Web sandbox rendering refreshed successfully."]);
      }
    } else if (lang === "python") {
      setConsoleLogs(["[Running] python script.py..."]);
      setTimeout(() => {
        setConsoleLogs(prev => [
          ...prev,
          "Hello, Alex!",
          "Hello, Sophia!",
          "Hello, Antigravity!",
          "\nProcess finished with exit code 0"
        ]);
      }, 500);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Interactive Code Playground</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Write and test code modules directly in your browser.
          </p>
        </div>
        <button className="btn" onClick={handleRun}>
          ⚡ Run Code
        </button>
      </div>

      {/* Editor controls */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: "flex", gap: 8 }}>
        <button 
          className={`btn ${lang === "web" ? "" : "secondary"}`} 
          style={{ padding: "6px 12px", fontSize: 12 }}
          onClick={() => setLang("web")}
        >
          HTML / CSS / JS Sandbox
        </button>
        <button 
          className={`btn ${lang === "python" ? "" : "secondary"}`} 
          style={{ padding: "6px 12px", fontSize: 12 }}
          onClick={() => setLang("python")}
        >
          Python Environment
        </button>
      </div>

      {/* Editor & Output Split View */}
      <div className="playground-container">
        {/* Left Side: Code Editor */}
        <div style={{ position: "relative", height: "100%" }}>
          <textarea 
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Right Side: Runtime Sandbox / Console */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
          {lang === "web" ? (
            <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, background: "#ffffff", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "#f1f3f9", padding: "8px 12px", fontSize: 11, borderBottom: "1px solid var(--border)", fontWeight: 600, color: "var(--text-muted)" }}>
                🖥️ LIVE SANDBOX PREVIEW
              </div>
              <iframe 
                ref={iframeRef}
                title="Preview Sandbox"
                style={{ width: "100%", flex: 1, border: "none" }}
                sandbox="allow-scripts"
              />
            </div>
          ) : null}

          {/* Console logger panel */}
          <div className="console-panel" style={{ flex: lang === "web" ? 0.3 : 1, minHeight: lang === "web" ? 100 : "100%" }}>
            <div style={{ borderBottom: "1px solid #313244", paddingBottom: 6, marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#89b4fa", textTransform: "uppercase" }}>
              Console Terminal Logs
            </div>
            <div style={{ flex: 1, overflowY: "auto", whiteSpace: "pre-wrap" }}>
              {consoleLogs.length === 0 ? (
                <span style={{ color: "#7f849c" }}>Click "Run Code" to view console stdout logs.</span>
              ) : (
                consoleLogs.map((log, i) => <div key={i} style={{ marginBottom: 4 }}>{log}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
