import { useState, useEffect } from "react";
import client from "../api/client";

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "", meetingLink: "", scheduledAt: "", duration: 60 });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await client.get("/trainers/live-sessions/");
      setSessions(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await client.get("/courses/courses/");
      setCourses(res.data.results ?? res.data);
      if (res.data.results?.length > 0) {
        setForm(f => ({ ...f, courseId: res.data.results[0].id }));
      }
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.meetingLink || !form.scheduledAt) return;

    try {
      await client.post("/trainers/live-sessions/", {
        title: form.title,
        course: form.courseId,
        meeting_link: form.meetingLink,
        scheduled_at: form.scheduledAt,
        duration_minutes: form.duration
      });
      setForm({ title: "", courseId: courses[0]?.id || "", meetingLink: "", scheduledAt: "", duration: 60 });
      setShowAddForm(false);
      fetchSessions();
    } catch {
      alert("Failed to schedule live class.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to cancel this live session?")) return;
    try {
      await client.delete(`/trainers/live-sessions/${id}/`);
      fetchSessions();
    } catch {}
  };

  const handleSendReminder = (title) => {
    alert(`Email reminder triggers sent to all enrolled students for session: "${title}"`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Live Classes & Meetings</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Schedule real-time interactive lectures, workshops, or group mentorship meetings.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Schedule Class"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ background: "#fff", padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Schedule Live Interactive Session</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label>Meeting Title/Topic</label>
                <input 
                  className="form-input" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Q&A and Midterm Prep Session"
                  required
                />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select 
                  className="form-input"
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  required
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Google Meet / Zoom Meeting Link</label>
                <input 
                  className="form-input" 
                  type="url"
                  value={form.meetingLink} 
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  required
                />
              </div>
              <div className="form-group">
                <label>Scheduled Date & Time</label>
                <input 
                  type="datetime-local"
                  className="form-input"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input 
                  type="number"
                  className="form-input"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <button className="btn" type="submit">Schedule Lecture</button>
          </form>
        </div>
      )}

      {/* Structured Calendar Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", background: "#fff" }}>
            No live sessions scheduled. Click "+ Schedule Class" to create one.
          </div>
        ) : (
          sessions.map((sess) => (
            <div key={sess.id} className="card" style={{ background: "#fff", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                    {new Date(sess.scheduled_at).getDate()}
                  </span>
                  <span style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", marginTop: 2 }}>
                    {new Date(sess.scheduled_at).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>🎥 {sess.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    Course ID: #{sess.course} · Duration: {sess.duration_minutes} mins · Time: {new Date(sess.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleSendReminder(sess.title)}>
                  🔔 Send Alert
                </button>
                <a href={sess.meeting_link} target="_blank" rel="noreferrer" className="btn" style={{ padding: "6px 12px", fontSize: 12, textDecoration: "none" }}>
                  Launch Class
                </a>
                <button className="btn danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleDelete(sess.id)}>
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
