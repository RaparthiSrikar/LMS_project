import { useState } from "react";

export default function PlacementPrep() {
  const [activeTab, setActiveTab] = useState("checklist");
  
  // Resume Analyzer States
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  // Mock Interview States
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [chatLog, setChatLog] = useState([]);
  
  const interviewQuestions = [
    "Tell me about a challenging technical problem you solved in your project.",
    "Explain the difference between SQL database normalization and denormalization. When would you use which?",
    "How does virtual DOM work in React, and how does it optimize UI renders?",
    "What is your approach to handling system load spikes and caching resources?",
  ];

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setReport(null);
    setTimeout(() => {
      setAnalyzing(false);
      setReport({
        score: 78,
        strengths: [
          "Clear experience summary and contact information layout.",
          "Good usage of technical keywords (React, REST APIs, Python).",
          "Includes links to github repositories and live projects."
        ],
        improvements: [
          "Include quantitative metrics (e.g. 'improved performance by 30%', 'reduced loading time by 15%').",
          "Ensure bullet points start with strong action verbs (e.g. Designed, Developed, Engineered).",
          "Add certifications and minor backend projects to show versatility."
        ]
      });
    }, 1500);
  };

  const handleStartInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIdx(0);
    setUserAnswer("");
    setChatLog([{ type: "bot", text: "Hello! I am your AI Mock Interview Assistant. Let's begin. " + interviewQuestions[0] }]);
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const newLogs = [...chatLog, { type: "user", text: userAnswer }];
    
    if (currentQuestionIdx < interviewQuestions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setChatLog([
        ...newLogs,
        { type: "bot", text: `Thanks for sharing. Here is the next question: ${interviewQuestions[nextIdx]}` }
      ]);
      setCurrentQuestionIdx(nextIdx);
    } else {
      setChatLog([
        ...newLogs,
        { type: "bot", text: "Great! That completes our session. Based on your inputs, your response details are structured well. Work on refining your delivery time and explaining system limits. Good luck!" }
      ]);
    }
    setUserAnswer("");
  };

  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <h2>Placement Preparation Panel</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
        Boost your career opportunities with resume checkups, practice interviews, and eligibility checklists.
      </p>

      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === "checklist" ? "active" : ""}`} 
          onClick={() => setActiveTab("checklist")}
        >
          Eligibility & Tracker
        </div>
        <div 
          className={`tab ${activeTab === "resume" ? "active" : ""}`} 
          onClick={() => setActiveTab("resume")}
        >
          AI Resume Scorer
        </div>
        <div 
          className={`tab ${activeTab === "interview" ? "active" : ""}`} 
          onClick={() => setActiveTab("interview")}
        >
          Mock Interview Bot
        </div>
      </div>

      {/* Checklist View */}
      {activeTab === "checklist" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3>Placement Readiness Score</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg)", border: "6px solid var(--accent)", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 22, fontWeight: 700, flexShrink: 0, justifyContent: "center" }}>
                60%
              </div>
              <div>
                <strong>Almost Ready!</strong>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                  Complete your courses, submit assignment solutions, and clear the resume audit review to unlock placement drives.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Milestone Checklist</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {[
                { label: "Profile Registration Completed", status: "completed" },
                { label: "Course Enrollment and Baseline Progress", status: "completed" },
                { label: "AI Resume Audit Review Passed", status: "pending" },
                { label: "Assignments & Projects Cleared (75% Score)", status: "completed" },
                { label: "1 Mock Interview Session Completed", status: "pending" },
                { label: "Aptitude & Technical Round Practice Set", status: "pending" },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: item.status === "completed" ? "var(--text)" : "var(--text-muted)" }}>
                    {item.status === "completed" ? "✅" : "⏳"} {item.label}
                  </span>
                  <span className={`badge ${item.status === "completed" ? "success" : ""}`} style={{ fontSize: 10 }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Analyzer View */}
      {activeTab === "resume" && (
        <div className="card">
          <h3>Simulated AI Resume Review</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Paste the raw text of your resume below to receive instant suggestions on content, formatting, and key technical words.
          </p>
          <div className="form-group" style={{ marginTop: 14 }}>
            <textarea 
              className="form-input" 
              rows={8} 
              placeholder="Paste your resume content (Contact, Skills, Projects, Work History)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
          <button 
            className="btn" 
            onClick={handleAnalyzeResume} 
            disabled={analyzing || !resumeText.trim()}
          >
            {analyzing ? "Analyzing Resume..." : "Analyze & Score Resume"}
          </button>

          {report && (
            <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4>Audit Feedback Report</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Score:</span>
                  <span className="badge success" style={{ fontSize: 14, padding: "4px 10px" }}>{report.score} / 100</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#F5FAF7", padding: 16, borderRadius: 8, borderLeft: "4px solid var(--success)" }}>
                  <strong style={{ color: "var(--success)", fontSize: 13 }}>⭐ Strengths</strong>
                  <ul style={{ margin: "10px 0 0 0", paddingLeft: 18, fontSize: 13, color: "#2B523D", lineHeight: 1.5 }}>
                    {report.strengths.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
                  </ul>
                </div>
                <div style={{ background: "#FFFBF5", padding: 16, borderRadius: 8, borderLeft: "4px solid var(--accent)" }}>
                  <strong style={{ color: "var(--accent-dark)", fontSize: 13 }}>💡 Areas to Improve</strong>
                  <ul style={{ margin: "10px 0 0 0", paddingLeft: 18, fontSize: 13, color: "#664D24", lineHeight: 1.5 }}>
                    {report.improvements.map((imp, i) => <li key={i} style={{ marginBottom: 6 }}>{imp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mock Interview View */}
      {activeTab === "interview" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 400 }}>
          <div className="toolbar" style={{ marginBottom: 12 }}>
            <h3>Mock Interview Simulator</h3>
            {!interviewStarted && (
              <button className="btn" onClick={handleStartInterview}>
                Start Session
              </button>
            )}
          </div>

          {!interviewStarted ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p>Practice answering core technical and behavioral interview questions. The assistant will log your responses and provide summary recommendations at the end.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Chat panel */}
              <div 
                style={{ 
                  flex: 1, 
                  background: "#f8f9fc", 
                  border: "1px solid var(--border)", 
                  borderRadius: 8, 
                  padding: 16, 
                  marginBottom: 16,
                  maxHeight: 300,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {chatLog.map((chat, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      alignSelf: chat.type === "bot" ? "flex-start" : "flex-end",
                      background: chat.type === "bot" ? "#fff" : "var(--accent)",
                      color: chat.type === "bot" ? "var(--text)" : "#1B1200",
                      padding: "10px 14px",
                      borderRadius: 12,
                      maxWidth: "80%",
                      fontSize: 13.5,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      lineHeight: 1.4
                    }}
                  >
                    {chat.text}
                  </div>
                ))}
              </div>

              {/* Input field */}
              {chatLog[chatLog.length - 1]?.text.includes("completes our session") ? (
                <button className="btn secondary" onClick={handleStartInterview}>Restart Session</button>
              ) : (
                <form onSubmit={handleSubmitAnswer} style={{ display: "flex", gap: 10 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Type your detailed answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    required
                    autoFocus
                  />
                  <button className="btn" type="submit">Submit</button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
