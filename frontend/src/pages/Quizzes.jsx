import { useState, useEffect } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import ResourcePage from "../components/ResourcePage";

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { question_id: choice_id }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Leaderboard state
  const [leaderboardQuiz, setLeaderboardQuiz] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await client.get("/quizzes/quizzes/");
      setQuizzes(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  const handleStartQuiz = async (quiz) => {
    try {
      // 1. Create a quiz attempt
      const attemptRes = await client.post("/quizzes/attempts/", { quiz: quiz.id });
      // 2. Fetch full quiz questions
      const quizRes = await client.get(`/quizzes/quizzes/${quiz.id}/`);
      
      setActiveQuiz(quizRes.data);
      setAttempt(attemptRes.data);
      setTimeLeft((quiz.time_limit_minutes || 15) * 60);
      setSelectedAnswers({});
      setResult(null);
    } catch (e) {
      alert("Could not initialize quiz session. Please try again.");
    }
  };

  const handleOptionSelect = (questionId, choiceId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleAutoSubmit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);

    try {
      // Save answers sequentially
      for (const [qId, cId] of Object.entries(selectedAnswers)) {
        await client.post("/quizzes/answers/", {
          attempt: attempt.id,
          question: Number(qId),
          selected_choice: Number(cId),
        });
      }
      // Submit & Auto Evaluate
      const res = await client.post(`/quizzes/attempts/${attempt.id}/submit/`);
      setResult(res.data);
      setActiveQuiz(null);
    } catch (e) {
      alert("Submission encountered an error, but answers were saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLeaderboard = async (quiz) => {
    setLeaderboardQuiz(quiz);
    setLoadingLeaderboard(true);
    try {
      const res = await client.get(`/quizzes/quizzes/${quiz.id}/leaderboard/`);
      setLeaderboardData(res.data);
    } catch {
      setLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Interactive Quizzes & Leaderboard</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 13 }}>
            Test your skills with timed assessments, negative marking, auto-grading, and rank on class leaderboards.
          </p>
        </div>
        <button className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={fetchQuizzes}>
          🔄 Refresh Quizzes
        </button>
      </div>

      {/* Quiz Cards Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          No active quizzes found. Trainers can create quizzes from the Course Builder or Management tools!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 32 }}>
          {quizzes.map((q) => (
            <div key={q.id} className="card" style={{ background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className="badge" style={{ fontSize: 11 }}>Course #{q.course}</span>
                  {Number(q.negative_marking) > 0 && (
                    <span className="badge danger" style={{ fontSize: 10 }}>-{q.negative_marking} Penalty</span>
                  )}
                </div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>{q.title}</h3>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, display: "flex", gap: 16 }}>
                  <span>⏱ {q.time_limit_minutes} Mins</span>
                  <span>❓ {q.question_count || q.questions?.length || 0} Questions</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => handleStartQuiz(q)}>
                  ▶ Start Quiz
                </button>
                <button className="btn secondary" style={{ padding: "6px 12px" }} onClick={() => handleOpenLeaderboard(q)}>
                  🏆 Ranks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin/Trainer CRUD management panel */}
      {user?.role !== "student" && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Trainer Quiz Management</h3>
          <ResourcePage
            title="Quiz Items"
            endpoint="/quizzes/quizzes/"
            columns={[
              { key: "title", label: "Title" },
              { key: "course", label: "Course ID" },
              { key: "time_limit_minutes", label: "Time (min)" },
              { key: "negative_marking", label: "Negative Marking" },
            ]}
            fields={[
              { name: "course", label: "Course ID", type: "number", required: true },
              { name: "title", label: "Title", required: true },
              { name: "time_limit_minutes", label: "Time limit (min)", type: "number" },
              { name: "negative_marking", label: "Negative marking penalty", type: "number" },
            ]}
          />
        </div>
      )}

      {/* Interactive Timed Quiz Player Modal */}
      {activeQuiz && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="card" style={{ width: "92%", maxWidth: 680, padding: 28, background: "var(--surface)", position: "relative", maxHeight: "90vh", overflowY: "auto", textAlign: "left" }}>
            {/* Top Bar Timer & Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>{activeQuiz.title}</h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Timed Quiz Attempt</span>
              </div>
              <div style={{
                background: timeLeft < 60 ? "#fef2f2" : "#eff6ff",
                color: timeLeft < 60 ? "var(--danger)" : "#1d4ed8",
                border: "1px solid " + (timeLeft < 60 ? "#fecaca" : "#bfdbfe"),
                padding: "6px 14px",
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 16
              }}>
                ⏱ {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Questions List */}
            {activeQuiz.questions?.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
                No questions added to this quiz yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {activeQuiz.questions?.map((q, idx) => (
                  <div key={q.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 16, background: "var(--bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Question {idx + 1} ({q.marks} pts)</span>
                      <span className="badge" style={{ textTransform: "uppercase", fontSize: 10 }}>{q.question_type}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px 0", lineHeight: 1.5 }}>{q.text}</p>

                    {/* Choices Radio Group */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.choices?.map((c) => {
                        const isSelected = selectedAnswers[q.id] === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleOptionSelect(q.id, c.id)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                              background: isSelected ? "var(--surface)" : "var(--surface)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: 13
                            }}
                          >
                            <input 
                              type="radio" 
                              name={`q_${q.id}`} 
                              checked={isSelected} 
                              onChange={() => {}} 
                            />
                            <span>{c.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <button className="btn secondary" onClick={() => setActiveQuiz(null)}>Cancel</button>
              <button className="btn" disabled={submitting} onClick={handleAutoSubmit}>
                {submitting ? "Evaluating..." : "Submit & Grade Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Result Modal */}
      {result && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3100 }}>
          <div className="card" style={{ width: "90%", maxWidth: 440, padding: 28, background: "var(--surface)", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🎉</div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 20 }}>Quiz Completed!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 20px 0" }}>
              Your answers have been auto-evaluated.
            </p>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Your Total Score</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "var(--accent)", margin: "4px 0" }}>
                {result.score} pts
              </div>
              <div style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>Auto Evaluation Passed ✓</div>
            </div>

            <button className="btn" style={{ width: "100%" }} onClick={() => setResult(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardQuiz && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 520, padding: 24, background: "var(--surface)", position: "relative", textAlign: "left" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setLeaderboardQuiz(null)}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>🏆 Quiz Leaderboard</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              Top student scores for <strong>{leaderboardQuiz.title}</strong>
            </p>

            {loadingLeaderboard ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading rankings...</div>
            ) : leaderboardData.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)" }}>
                No completed attempts submitted yet for this quiz.
              </div>
            ) : (
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Rank</th>
                    <th>Student Name</th>
                    <th>Score</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((att, idx) => (
                    <tr key={att.id}>
                      <td style={{ fontWeight: 700 }}>
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </td>
                      <td style={{ fontWeight: 500 }}>{att.student_name || `Student #${att.student}`}</td>
                      <td style={{ fontWeight: 700, color: "var(--accent)" }}>{att.score} pts</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {new Date(att.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
