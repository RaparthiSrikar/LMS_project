import { useState, useEffect } from "react";
import client from "../api/client";

const LEVEL_COLORS = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444"
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "beginner",
    duration_weeks: 8,
    price: 99,
    discount_percent: 10,
    description: "",
    is_published: false
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await client.get("/courses/courses/");
      setCourses(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
    }));
  };

  const handleEditClick = (c) => {
    setFormData(c);
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await client.delete(`/courses/courses/${id}/`);
      loadCourses();
    } catch {}
  };

  const handleTogglePublish = async (c) => {
    try {
      const res = await client.patch(`/courses/courses/${c.id}/`, {
        is_published: !c.is_published
      });
      loadCourses();
    } catch {
      alert("Failed to toggle publish status.");
    }
  };

  const handleDuplicate = (c) => {
    setFormData({
      ...c,
      name: `${c.name} (Copy)`
    });
    setEditId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await client.put(`/courses/courses/${editId}/`, formData);
      } else {
        await client.post("/courses/courses/", formData);
      }
      setFormData({ name: "", level: "beginner", duration_weeks: 8, price: 99, discount_percent: 10, description: "", is_published: false });
      setEditId(null);
      setShowForm(false);
      loadCourses();
    } catch (err) {
      alert("Failed to save course.");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Course Management</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Create, duplicate, publish, and manage pricing structure for online courses.
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => {
            setFormData({ name: "", level: "beginner", duration_weeks: 8, price: 99, discount_percent: 10, description: "", is_published: false });
            setEditId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ background: "var(--surface)", padding: 24, marginBottom: 28, border: "1px solid var(--border)", textAlign: "left" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>
            {editId ? "Edit Course Settings" : "Create New Course"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Course Title</label>
                <input 
                  className="form-input" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="e.g. Advanced React Architecture"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Level</label>
                <select 
                  className="form-input" 
                  name="level" 
                  value={formData.level} 
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Duration (weeks)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="duration_weeks" 
                  value={formData.duration_weeks} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Price ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Discount %</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="discount_percent" 
                  value={formData.discount_percent} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, height: "100%" }}>
                <input 
                  type="checkbox" 
                  id="pub-check" 
                  name="is_published"
                  checked={formData.is_published} 
                  onChange={handleChange}
                />
                <label htmlFor="pub-check" style={{ userSelect: "none", cursor: "pointer", margin: 0 }}>Publish Immediately</label>
              </div>
            </div>
            <div className="form-group">
              <label>Course Description</label>
              <textarea 
                className="form-input" 
                name="description" 
                rows={3} 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Give a brief summary of what students will learn..."
              />
            </div>
            <button className="btn" type="submit">
              {editId ? "Update Course" : "Save Course"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)" }}>
          No courses created yet. Click "+ New Course" to get started.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {courses.map((c) => (
            <div key={c.id} className="card animate-fade-in" style={{ background: "var(--surface)", display: "flex", flexDirection: "column", padding: 20, textAlign: "left", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span className="badge" style={{ background: LEVEL_COLORS[c.level] || "#ccc", color: "#fff", fontSize: 10, textTransform: "capitalize" }}>
                  {c.level}
                </span>
                <span className={"badge " + (c.is_published ? "success" : "")} style={{ fontSize: 10 }}>
                  {c.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 600 }}>{c.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, flex: 1, margin: "0 0 16px 0", height: 50, overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.description || "No description provided."}
              </p>
              
              <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Duration: {c.duration_weeks} wks</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>
                  ${c.final_price || c.price}
                  {c.discount_percent > 0 && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 6 }}>
                      ${c.price}
                    </span>
                  )}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <button className="btn secondary" style={{ padding: "6px 8px", fontSize: 11 }} onClick={() => handleEditClick(c)}>
                  Edit
                </button>
                <button className="btn secondary" style={{ padding: "6px 8px", fontSize: 11 }} onClick={() => handleDuplicate(c)}>
                  Copy
                </button>
                <button className="btn danger" style={{ padding: "6px 8px", fontSize: 11 }} onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              </div>
              <button 
                className="btn" 
                style={{ width: "100%", marginTop: 8, padding: 6, fontSize: 12, background: c.is_published ? "#f1f5f9" : "var(--accent)", color: c.is_published ? "#1e293b" : "#1B1200", border: "1px solid #cbd5e1" }}
                onClick={() => handleTogglePublish(c)}
              >
                {c.is_published ? "Unpublish Course" : "Publish Course"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
