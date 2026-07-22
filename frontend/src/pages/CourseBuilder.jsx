import { useState, useEffect } from "react";
import client from "../api/client";

export default function CourseBuilder() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([
    { id: 1, name: "Module 1: Getting Started", lessons: [
      { id: 101, title: "Course Introduction & Setup", type: "video", duration: "12m" },
      { id: 102, title: "Development Environment Config", type: "note", format: "PDF" }
    ]},
    { id: 2, name: "Module 2: Core Concepts", lessons: [
      { id: 201, title: "Understanding Lifecycle Methods", type: "video", duration: "18m" },
      { id: 202, title: "State vs Props Sandbox", type: "assignment", points: 100 }
    ]}
  ]);
  const [newModuleName, setNewModuleName] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);

  useEffect(() => {
    client.get("/courses/courses/")
      .then((r) => {
        const list = r.data.results ?? r.data;
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]);
      })
      .catch(() => {});
  }, []);

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    const newMod = {
      id: Date.now(),
      name: newModuleName,
      lessons: []
    };
    setModules([...modules, newMod]);
    setNewModuleName("");
    setShowAddModule(false);
  };

  const handleDeleteModule = (id) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const handleMoveLesson = (modId, lessonId, direction) => {
    setModules(modules.map(mod => {
      if (mod.id !== modId) return mod;
      const idx = mod.lessons.findIndex(l => l.id === lessonId);
      if (idx === -1) return mod;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= mod.lessons.length) return mod;

      const newLessons = [...mod.lessons];
      const temp = newLessons[idx];
      newLessons[idx] = newLessons[targetIdx];
      newLessons[targetIdx] = temp;
      return { ...mod, lessons: newLessons };
    }));
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>Course Builder</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Organize modules, schedule lectures, and manage lesson sequences.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Course:</span>
          <select 
            className="form-input" 
            style={{ width: 220, margin: 0 }}
            value={selectedCourse?.id ?? ""}
            onChange={(e) => setSelectedCourse(courses.find(c => c.id === Number(e.target.value)))}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            {courses.length === 0 && <option value="">No courses taught</option>}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {modules.map((mod) => (
          <div key={mod.id} className="card" style={{ background: "#fff", padding: 24, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{mod.name}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn secondary" 
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => {
                    const lTitle = prompt("Enter lesson title:");
                    if (lTitle) {
                      const newLesson = { id: Date.now(), title: lTitle, type: "video", duration: "10m" };
                      setModules(modules.map(m => m.id === mod.id ? { ...m, lessons: [...m.lessons, newLesson] } : m));
                    }
                  }}
                >
                  + Add Lesson
                </button>
                <button 
                  className="btn danger" 
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => handleDeleteModule(mod.id)}
                >
                  Delete Module
                </button>
              </div>
            </div>

            {mod.lessons.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "#f8f9fc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                No lessons in this module. Click "+ Add Lesson" to start populating content.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mod.lessons.map((lesson, idx) => (
                  <div key={lesson.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8f9fc", borderRadius: 8, border: "1px solid #eef2f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ cursor: "grab", color: "var(--text-muted)" }}>☰</span>
                      <span className="badge" style={{ background: lesson.type === "video" ? "var(--accent)" : "#e2e8f0", color: lesson.type === "video" ? "#1B1200" : "inherit", textTransform: "capitalize", fontSize: 11 }}>
                        {lesson.type}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{lesson.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{lesson.duration || `${lesson.points} pts`}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button 
                          className="btn secondary" 
                          style={{ padding: "2px 6px", fontSize: 11, minWidth: 24 }}
                          disabled={idx === 0}
                          onClick={() => handleMoveLesson(mod.id, lesson.id, -1)}
                        >
                          ▲
                        </button>
                        <button 
                          className="btn secondary" 
                          style={{ padding: "2px 6px", fontSize: 11, minWidth: 24 }}
                          disabled={idx === mod.lessons.length - 1}
                          onClick={() => handleMoveLesson(mod.id, lesson.id, 1)}
                        >
                          ▼
                        </button>
                        <button 
                          className="btn danger" 
                          style={{ padding: "2px 6px", fontSize: 11 }}
                          onClick={() => setModules(modules.map(m => m.id === mod.id ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m))}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {showAddModule ? (
          <div className="card" style={{ padding: 20, background: "#fff", border: "1px solid var(--border)" }}>
            <h4 style={{ margin: "0 0 12px 0" }}>New Module</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <input 
                className="form-input" 
                placeholder="e.g. Module 3: Advanced Architectures"
                value={newModuleName} 
                onChange={(e) => setNewModuleName(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button className="btn" onClick={handleAddModule}>Add</button>
              <button className="btn secondary" onClick={() => setShowAddModule(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button 
            className="btn" 
            style={{ width: "100%", padding: 14, background: "#f8f9fc", color: "var(--text-main)", borderColor: "#e2e8f0", borderStyle: "dashed" }}
            onClick={() => setShowAddModule(true)}
          >
            + Create New Module
          </button>
        )}
      </div>
    </div>
  );
}
