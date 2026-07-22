import { useState, useEffect } from "react";
import client from "../api/client";

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "", url: "", duration: 15, date: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await client.get("/trainers/videos/");
      setVideos(res.data.results ?? res.data);
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
    fetchVideos();
    fetchCourses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId) return;

    try {
      await client.post("/trainers/videos/", {
        title: form.title,
        course: form.courseId,
        url: form.url,
        duration_minutes: form.duration,
        date: form.date || null
      });
      setForm({ title: "", courseId: courses[0]?.id || "", url: "", duration: 15, date: "" });
      setShowAddForm(false);
      fetchVideos();
    } catch {
      alert("Failed to save video.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this video lecture?")) return;
    try {
      await client.delete(`/trainers/videos/${id}/`);
      fetchVideos();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Video Lectures Library</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Manage lecture streams, upload tutorials, or link to YouTube and Vimeo lessons.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Video"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ background: "var(--surface)", padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Upload or Link Video</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label>Lecture Title</label>
                <input 
                  className="form-input" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced Routing & Navigation"
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
                <label>Video Stream URL</label>
                <input 
                  className="form-input" 
                  value={form.url} 
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
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
            </div>
            <button className="btn" type="submit">Publish Video</button>
          </form>
        </div>
      )}

      <div className="card" style={{ background: "var(--surface)", padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading videos...</div>
        ) : videos.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No videos uploaded yet. Click "+ Add Video" to publish a video.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Title</th>
                <th style={{ textAlign: "left" }}>Course ID</th>
                <th style={{ textAlign: "left" }}>Scheduled Date</th>
                <th style={{ textAlign: "left" }}>Duration</th>
                <th style={{ textAlign: "left" }}>Streaming Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((vid) => (
                <tr key={vid.id}>
                  <td style={{ textAlign: "left", fontWeight: 500 }}>
                    ▶️ {vid.title}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    Course #{vid.course}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    {vid.date ? new Date(vid.date).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    {vid.duration_minutes} mins
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <span className="badge success" style={{ textTransform: "capitalize" }}>Ready</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {vid.url && (
                      <button className="btn secondary" style={{ marginRight: 8, padding: "4px 8px", fontSize: 12 }} onClick={() => setPreviewUrl(vid.url)}>
                        Preview
                      </button>
                    )}
                    <button className="btn danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleDelete(vid.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {previewUrl && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 640, padding: 12, background: "#111", border: "none", position: "relative" }}>
            <button 
              style={{ position: "absolute", right: 10, top: 10, background: "#fff", border: "none", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, zIndex: 10 }}
              onClick={() => setPreviewUrl(null)}
            >
              ✕
            </button>
            <video src={previewUrl} controls autoPlay style={{ width: "100%", borderRadius: 6, display: "block" }} />
          </div>
        </div>
      )}
    </div>
  );
}
