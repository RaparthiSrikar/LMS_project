import { useState } from "react";

const QUESTIONS_DATA = {
  JavaScript: [
    {
      id: 101,
      q: "Which keyword is used to declare a variable that is block-scoped and cannot be reassigned?",
      options: ["var", "let", "const", "set"],
      correct: "const",
      explain: "'const' creates a read-only block-scoped reference to a value. It cannot be reassigned, though object properties inside it can be altered."
    },
    {
      id: 102,
      q: "What is the output of 'console.log(typeof null)' in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'string'"],
      correct: "'object'",
      explain: "This is a long-standing bug/behavior in JavaScript where typeof null returns 'object'. Changing it would break existing web systems."
    }
  ],
  Python: [
    {
      id: 201,
      q: "Which data type is mutable in Python?",
      options: ["tuple", "list", "str", "int"],
      correct: "list",
      explain: "Lists in Python are mutable, meaning you can add, change, or remove items after creation. Tuples, strings, and integers are immutable."
    },
    {
      id: 202,
      q: "How do you insert an element at a specific index in a Python list?",
      options: ["list.append()", "list.add()", "list.insert()", "list.push()"],
      correct: "list.insert()",
      explain: "The insert() method takes the index as the first argument and the item value as the second argument, e.g. list.insert(index, value)."
    }
  ],
  SQL: [
    {
      id: 301,
      q: "Which SQL clause is used to filter query result groups containing aggregate values?",
      options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
      correct: "HAVING",
      explain: "HAVING is used to filter groups created by aggregate functions and GROUP BY. WHERE filters row inputs before aggregation."
    }
  ],
  DSA: [
    {
      id: 401,
      q: "What is the average time complexity of searching a value in a balanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correct: "O(log n)",
      explain: "In a balanced BST, each step narrows down the lookup area by half, leading to a logarithmic search time complexity of O(log n)."
    }
  ]
};

export default function QuestionBank() {
  const [topic, setTopic] = useState("JavaScript");
  const [answers, setAnswers] = useState({}); // questionId -> selectedOption
  const [submitted, setSubmitted] = useState({}); // questionId -> bool
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const handleSelectOption = (qId, option) => {
    if (submitted[qId]) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = (qId, correctOption) => {
    if (submitted[qId] || !answers[qId]) return;
    
    setSubmitted(prev => ({ ...prev, [qId]: true }));
    setTotalAttempts(prev => prev + 1);
    if (answers[qId] === correctOption) {
      setScore(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted({});
    setScore(0);
    setTotalAttempts(0);
  };

  const activeQuestions = QUESTIONS_DATA[topic];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="toolbar">
        <div>
          <h2>Question Bank & Practice</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Practice multiple-choice questions to ace your upcoming interviews.
          </p>
        </div>
        {(totalAttempts > 0) && (
          <button className="btn secondary" onClick={handleReset}>
            Reset Score
          </button>
        )}
      </div>

      {/* Session Score Card */}
      <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <span>Active Subject: <strong>{topic}</strong></span>
        <div style={{ fontWeight: 600 }}>
          Score: <span className="badge success" style={{ fontSize: 13 }}>{score} / {totalAttempts} Correct</span>
        </div>
      </div>

      {/* Topic selection tabs */}
      <div className="tabs">
        {Object.keys(QUESTIONS_DATA).map(t => (
          <div 
            key={t} 
            className={`tab ${topic === t ? "active" : ""}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Questions list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {activeQuestions.map((q, index) => {
          const isSelected = answers[q.id];
          const isDone = submitted[q.id];
          const isCorrect = answers[q.id] === q.correct;

          return (
            <div key={q.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <span className="badge" style={{ background: "#eee", alignSelf: "start" }}>Q{index + 1}</span>
                <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{q.q}</span>
              </div>

              {/* Options Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
                {q.options.map(opt => {
                  const activeOpt = answers[q.id] === opt;
                  let bg = "transparent";
                  let border = "1px solid var(--border)";
                  let color = "var(--text)";

                  if (activeOpt) {
                    bg = "#e0ebff";
                    border = "1.5px solid #1b75ff";
                  }
                  if (isDone) {
                    if (opt === q.correct) {
                      bg = "#E5F6EC";
                      border = "1.5px solid var(--success)";
                      color = "#206a44";
                    } else if (activeOpt && !isCorrect) {
                      bg = "#FCEBEB";
                      border = "1.5px solid var(--danger)";
                      color = "#a82e2e";
                    }
                  }

                  return (
                    <button 
                      key={opt}
                      style={{ 
                        background: bg, 
                        border: border, 
                        color: color, 
                        borderRadius: 8, 
                        padding: "10px 14px", 
                        fontSize: 13.5, 
                        textAlign: "left",
                        cursor: isDone ? "not-allowed" : "pointer",
                        fontWeight: activeOpt ? 600 : 500,
                        transition: "all 0.1s ease"
                      }}
                      onClick={() => handleSelectOption(q.id, opt)}
                      disabled={isDone}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {isDone && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: isCorrect ? "var(--success)" : "var(--danger)" }}>
                      {isCorrect ? "✓ Correct Answer!" : `✗ Incorrect (Correct: ${q.correct})`}
                    </span>
                  )}
                </div>
                {!isDone && (
                  <button 
                    className="btn" 
                    disabled={!isSelected}
                    onClick={() => handleSubmit(q.id, q.correct)}
                  >
                    Submit Answer
                  </button>
                )}
              </div>

              {/* Explanation slide-down */}
              {isDone && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8f9fa", borderRadius: 8, borderLeft: "4px solid #1b75ff", fontSize: 12.5, lineHeight: 1.5, color: "var(--text-muted)" }}>
                  <strong>Explanation:</strong> {q.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
