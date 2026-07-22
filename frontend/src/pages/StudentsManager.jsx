import { useState, useEffect } from "react";
import client from "../api/client";

export default function StudentsManager() {
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", progress: 85, enrollmentDate: "2026-05-10", lastActive: "1 day ago", status: "Active", course: "React for Beginners" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", progress: 42, enrollmentDate: "2026-05-12", lastActive: "3 hours ago", status: "Active", course: "Django REST Advanced" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", progress: 100, enrollmentDate: "2026-04-18", lastActive: "5 days ago", status: "Completed", course: "React for Beginners" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [activeChatStudent, setActiveChatStudent] = useState(null);
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    alert(`Message successfully sent to ${activeChatStudent.name}: "${chatMessage}"`);
    setChatMessage("");
    setActiveChatStudent(null);
  };

  const handleRemove = (id, name) => {
    if (confirm(`Are you sure you want to de-enroll ${name} from this course?`)) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "all" || s.course.toLowerCase().includes(filterCourse.toLowerCase());
    return matchesSearch && matchesCourse;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Student Management</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Monitor student pathways, check course completion ratios, and resolve queries.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: 16, background: "#fff", display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input 
            className="form-input" 
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0, width: "100%" }}
          />
        </div>
        <div>
          <select 
            className="form-input"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={{ margin: 0, width: 200 }}
          >
            <option value="all">All Courses</option>
            <option value="react">React for Beginners</option>
            <option value="django">Django REST Advanced</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ background: "#fff", padding: 20 }}>
        {filteredStudents.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No students found matching your filters.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Student</th>
                <th style={{ textAlign: "left" }}>Course</th>
                <th style={{ textAlign: "left" }}>Progress</th>
                <th style={{ textAlign: "left" }}>Last Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => (
                <tr key={st.id}>
                  <td style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600 }}>{st.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{st.email}</div>
                  </td>
                  <td style={{ textAlign: "left" }}>{st.course}</td>
                  <td style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 80, background: "#e2e8f0", height: 6, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${st.progress}%`, background: st.progress === 100 ? "var(--success)" : "var(--accent)", height: "100%" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{st.progress}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>{st.lastActive}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn secondary" style={{ marginRight: 8, padding: "4px 8px", fontSize: 12 }} onClick={() => setActiveChatStudent(st)}>
                      💬 Message
                    </button>
                    <button className="btn danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleRemove(st.id, st.name)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeChatStudent && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 400, padding: 24, background: "#fff", position: "relative" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setActiveChatStudent(null)}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 8px 0" }}>Message to {activeChatStudent.name}</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>This sends a direct notification dashboard toast alert to the student.</p>
            <form onSubmit={handleSendMessage}>
              <textarea
                className="form-input"
                rows={4}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message here..."
                required
                style={{ width: "100%", marginBottom: 16 }}
              />
              <div style={{ display: "flex", justify: "flex-end", gap: 10 }}>
                <button type="button" className="btn secondary" onClick={() => setActiveChatStudent(null)}>Cancel</button>
                <button type="submit" className="btn">Send Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
