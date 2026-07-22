import { useState, useEffect } from "react";
import client from "../api/client";

export default function NotesManager() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "", file: null, date: "", isPublic: true });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await client.get("/trainers/notes/");
      setNotes(res.data.results ?? res.data);
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
    fetchNotes();
    fetchCourses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId) return;

    // Use FormData for file uploads
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("course", form.courseId);
    if (form.date) {
      formData.append("date", form.date);
    }
    if (form.file) {
      formData.append("file", form.file);
    }

    try {
      await client.post("/trainers/notes/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ title: "", courseId: courses[0]?.id || "", file: null, date: "", isPublic: true });
      setShowAddForm(false);
      fetchNotes();
    } catch {
      alert("Failed to save note.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await client.delete(`/trainers/notes/${id}/`);
      fetchNotes();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Notes & Documents</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Upload, replace, and configure study resources for your students.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Upload Notes"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ background: "var(--surface)", padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Upload Study File</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  className="form-input" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Week 1 Cheat Sheet"
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
                <label>File Upload (PDF, ZIP, DOCX)</label>
                <input 
                  type="file" 
                  className="form-input"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Scheduled Date</label>
                <input 
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select 
                  className="form-input"
                  value={form.isPublic ? "public" : "private"}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.value === "public" })}
                >
                  <option value="public">Visible (Public)</option>
                  <option value="private">Hidden (Private)</option>
                </select>
              </div>
            </div>
            <button className="btn" type="submit">Submit Upload</button>
          </form>
        </div>
      )}

      <div className="card" style={{ background: "var(--surface)", padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No study materials uploaded yet. Click "+ Upload Notes" to add files.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Title</th>
                <th style={{ textAlign: "left" }}>Course ID</th>
                <th style={{ textAlign: "left" }}>Scheduled Date</th>
                <th style={{ textAlign: "left" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td style={{ textAlign: "left", fontWeight: 500 }}>
                    📄 {note.title}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    Course #{note.course}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    {note.date ? new Date(note.date).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <span className="badge success">Active</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {note.file && (
                      <a href={note.file} target="_blank" rel="noreferrer" className="btn secondary" style={{ marginRight: 8, textDecoration: "none", display: "inline-block", padding: "4px 8px", fontSize: 12 }}>
                        View
                      </a>
                    )}
                    <button className="btn danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleDelete(note.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}
