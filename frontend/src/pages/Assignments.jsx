import { useState, useEffect } from "react";
import ResourcePage from "../components/ResourcePage";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Assignments() {
  const { user } = useAuth();
  const [tab, setTab] = useState("assignments");
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", remarks: "" });
  const [courses, setCourses] = useState([]);

  const isStudent = user?.role === "student";

  // Fetch courses for dropdown
  useEffect(() => {
    client.get("/courses/courses/")
      .then((res) => {
        const list = res.data.results ?? res.data;
        setCourses(list.map((c) => ({ value: c.id, label: `${c.name || c.title || 'Course'} (ID: #${c.id})` })));
      })
      .catch(() => {});
  }, []);

  const fetchSubmissions = async () => {
    setLoadingSubs(true);
    try {
      const res = await client.get("/assignments/submissions/");
      setSubmissions(res.data.results ?? res.data);
    } catch {}
    setLoadingSubs(false);
  };

  useEffect(() => {
    if (!isStudent && tab === "submissions") {
      fetchSubmissions();
    }
  }, [tab, isStudent]);

  const handleOpenGradeModal = (sub) => {
    setActiveSubmission(sub);
    setGradeForm({
      marks: sub.marks_awarded ?? "",
      remarks: sub.remarks ?? ""
    });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      // 1. Send evaluate request
      await client.post(`/assignments/submissions/${activeSubmission.id}/evaluate/`, {
        marks_awarded: Number(gradeForm.marks),
        remarks: gradeForm.remarks
      });
      // 2. Publish results immediately
      await client.post(`/assignments/submissions/${activeSubmission.id}/publish-result/`);
      
      setActiveSubmission(null);
      fetchSubmissions();
    } catch {
      alert("Failed to submit assignment evaluation.");
    }
  };

  const courseFields = courses.length > 0 ? [
    { name: "course", label: "Select Course", type: "select", options: courses, required: true },
    { name: "title", label: "Assignment Title", required: true },
    { name: "description", label: "Instructions / Description", type: "textarea" },
    { name: "file", label: "Upload Resource File / Assignment PDF", type: "file" },
    { name: "date", label: "Scheduled Start Date", type: "date", required: true },
    { name: "due_date", label: "Set Due Date & Time", type: "datetime-local", required: true },
    { name: "max_marks", label: "Assign Maximum Marks", type: "number", required: true }
  ] : [
    { name: "course", label: "Course ID", type: "number", required: true },
    { name: "title", label: "Assignment Title", required: true },
    { name: "description", label: "Instructions / Description", type: "textarea" },
    { name: "file", label: "Upload Resource File / Assignment PDF", type: "file" },
    { name: "date", label: "Scheduled Start Date", type: "date", required: true },
    { name: "due_date", label: "Set Due Date & Time", type: "datetime-local", required: true },
    { name: "max_marks", label: "Assign Maximum Marks", type: "number", required: true }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>Assignment Management</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 13 }}>
            Create assignments, upload files, set due dates, and evaluate student submissions.
          </p>
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          <div 
            className={"tab" + (tab === "assignments" ? " active" : "")} 
            onClick={() => setTab("assignments")}
          >
            Assignments List
          </div>
          <div 
            className={"tab" + (tab === "submissions" ? " active" : "")} 
            onClick={() => setTab("submissions")}
          >
            {isStudent ? "My Submissions" : "Grade & Assign Marks"}
          </div>
        </div>
      </div>

      {tab === "assignments" ? (
        <ResourcePage
          title="Assignments List"
          endpoint="/assignments/assignments/"
          columns={[
            { key: "title", label: "Assignment Title" }, 
            { 
              key: "course_name", 
              label: "Course", 
              render: (r) => r.course_name ? r.course_name : `Course #${r.course}`
            }, 
            { 
              key: "file", 
              label: "Uploaded File", 
              render: (r) => r.file ? (
                <a 
                  href={r.file} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn secondary" 
                  style={{ textDecoration: "none", padding: "4px 10px", fontSize: 12 }}
                >
                  📎 View File
                </a>
              ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>No file</span>
            },
            { 
              key: "date", 
              label: "Scheduled Date", 
              render: (r) => r.date ? new Date(r.date).toLocaleDateString() : "—" 
            },
            { 
              key: "due_date", 
              label: "Due Date", 
              render: (r) => {
                if (!r.due_date) return "—";
                const d = new Date(r.due_date);
                const isPast = d < new Date();
                return (
                  <span style={{ color: isPast ? "var(--danger)" : "var(--text)", fontWeight: 500 }}>
                    {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isPast && <span style={{ fontSize: 10, marginLeft: 6, color: "var(--danger)" }}>(Ended)</span>}
                  </span>
                );
              }
            }, 
            { 
              key: "max_marks", 
              label: "Max Marks",
              render: (r) => <span style={{ fontWeight: 600 }}>{r.max_marks} pts</span>
            }
          ]}
          fields={courseFields}
        />
      ) : (
        <>
          {isStudent ? (
            <ResourcePage
              title="My Submissions"
              endpoint="/assignments/submissions/"
              columns={[
                { key: "assignment_title", label: "Assignment", render: (r) => r.assignment_title || `Assignment #${r.assignment}` }, 
                { 
                  key: "status", 
                  label: "Status",
                  render: (r) => (
                    <span className={"badge " + (r.status === "evaluated" ? "success" : "warning")}>
                      {r.status}
                    </span>
                  )
                }, 
                { 
                  key: "marks_awarded", 
                  label: "Marks Awarded",
                  render: (r) => r.marks_awarded !== null && r.marks_awarded !== undefined
                    ? `${r.marks_awarded} / ${r.max_marks || 100} pts`
                    : "Pending evaluation"
                },
                {
                  key: "remarks",
                  label: "Trainer Remarks",
                  render: (r) => r.remarks || "—"
                }
              ]}
              fields={[
                { name: "assignment", label: "Assignment ID", type: "number", required: true },
                { name: "document", label: "Upload Completed Document / Code File", type: "file", required: true }
              ]}
            />
          ) : (
            <div className="card" style={{ background: "var(--surface)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Student Submissions & Grading</h3>
                <button className="btn secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={fetchSubmissions}>
                  🔄 Refresh List
                </button>
              </div>

              {loadingSubs ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 30 }}>Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
                  No student submissions found.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Student</th>
                      <th style={{ textAlign: "left" }}>Assignment</th>
                      <th style={{ textAlign: "left" }}>Submitted Date</th>
                      <th style={{ textAlign: "left" }}>Status</th>
                      <th style={{ textAlign: "left" }}>Marks Awarded</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td style={{ textAlign: "left", fontWeight: 500 }}>
                          {sub.student_name || `Student #${sub.student}`}
                        </td>
                        <td style={{ textAlign: "left" }}>
                          {sub.assignment_title || `Assignment #${sub.assignment}`}
                        </td>
                        <td style={{ textAlign: "left" }}>
                          {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: "left" }}>
                          <span className={"badge " + (sub.status === "evaluated" ? "success" : "warning")}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "left", fontWeight: 600 }}>
                          {sub.marks_awarded !== null && sub.marks_awarded !== undefined
                            ? `${sub.marks_awarded} / ${sub.max_marks || 100} pts`
                            : "—"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {sub.document && (
                            <a 
                              href={sub.document} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn secondary" 
                              style={{ marginRight: 8, textDecoration: "none", display: "inline-block", padding: "4px 10px", fontSize: 12 }}
                            >
                              📁 View File
                            </a>
                          )}
                          <button 
                            className="btn" 
                            style={{ padding: "4px 10px", fontSize: 12 }} 
                            onClick={() => handleOpenGradeModal(sub)}
                          >
                            Assign Marks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Grade modal sheet */}
      {activeSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 480, padding: 24, background: "var(--surface)", position: "relative", textAlign: "left" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setActiveSubmission(null)}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Assign Marks & Feedback</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Student: <strong>{activeSubmission.student_name || `Student #${activeSubmission.student}`}</strong> · Assignment: <strong>{activeSubmission.assignment_title || `#${activeSubmission.assignment}`}</strong>
            </p>

            <form onSubmit={handleSaveGrade}>
              <div className="form-group">
                <label>
                  Marks Awarded (Max: {activeSubmission.max_marks || 100} pts)
                </label>
                <input 
                  type="number"
                  className="form-input" 
                  value={gradeForm.marks}
                  onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                  placeholder={`Enter score (0 - ${activeSubmission.max_marks || 100})`}
                  max={activeSubmission.max_marks || 100}
                  min={0}
                  required
                />
              </div>
              <div className="form-group">
                <label>Feedback Remarks</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  value={gradeForm.remarks}
                  onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                  placeholder="Provide constructive feedback for the student..."
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" className="btn secondary" onClick={() => setActiveSubmission(null)}>Cancel</button>
                <button type="submit" className="btn">Assign Marks & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
