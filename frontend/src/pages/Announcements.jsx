import { useState, useEffect } from "react";
import client from "../api/client";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "", message: "", isPinned: false });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await client.get("/trainers/announcements/");
      setAnnouncements(res.data.results ?? res.data);
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
    fetchAnnouncements();
    fetchCourses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.message) return;

    try {
      await client.post("/trainers/announcements/", {
        title: form.title,
        course: form.courseId,
        message: form.message
      });
      setForm({ title: "", courseId: courses[0]?.id || "", message: "", isPinned: false });
      setShowAddForm(false);
      fetchAnnouncements();
    } catch {
      alert("Failed to publish announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await client.delete(`/trainers/announcements/${id}/`);
      fetchAnnouncements();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Announcements Board</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Broadcast news, changes, or alerts to enrolled students.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ background: "#fff", padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Create Announcement</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Title</label>
                  <input 
                    className="form-input" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Live Q&A session postponed to Friday"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Course Target</label>
                  <select 
                    className="form-input"
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    required
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Announcement Message</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter the details of your announcement here..."
                  required
                />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input 
                  type="checkbox"
                  id="pin-check"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                />
                <label htmlFor="pin-check" style={{ userSelect: "none", cursor: "pointer" }}>Pin this announcement to top of course wall</label>
              </div>
            </div>
            <button className="btn" type="submit">Broadcast Bulletin</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>Loading bulletins...</div>
        ) : announcements.length === 0 ? (
          <div className="card" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", background: "#fff" }}>
            No announcements broadcasted yet. Click "+ New Announcement" to make one.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ background: "#fff", padding: 24, border: "1px solid var(--border)", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>📣 {ann.title}</span>
                    {ann.isPinned && <span className="badge warning">Pinned</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Course ID: #{ann.course} · Published: {new Date(ann.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button className="btn danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleDelete(ann.id)}>
                  Delete
                </button>
              </div>
              <p style={{ textAlign: "left", fontSize: 14, color: "var(--text-main)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                {ann.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
