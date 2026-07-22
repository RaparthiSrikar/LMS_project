import { useEffect, useState } from "react";

const INITIAL_TASKS = [];

export default function Taskflow() {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("student_taskflow");
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem("student_taskflow", JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("student_taskflow", JSON.stringify(newTasks));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title) return;

    const newT = {
      id: Date.now(),
      title,
      desc,
      column: "todo",
      priority,
      date: dueDate || new Date().toISOString().split('T')[0]
    };

    saveTasks([newT, ...tasks]);
    setTitle("");
    setDesc("");
    setPriority("Medium");
    setDueDate("");
    setShowAddForm(false);
  };

  const moveTask = (id, newCol) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, column: newCol };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this task?")) return;
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const renderColumn = (colName, colTitle) => {
    const colTasks = tasks.filter(t => t.column === colName);

    return (
      <div className="kanban-col" key={colName}>
        <div className="kanban-col-header">
          <span>{colTitle}</span>
          <span className="badge" style={{ background: "#dcdfe6", color: "var(--text)" }}>{colTasks.length}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {colTasks.map(t => (
            <div className="kanban-card" key={t.id}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="badge" style={{ 
                    fontSize: 9, 
                    background: t.priority === "High" ? "#FFEBEB" : t.priority === "Medium" ? "#FFF3E6" : "#E5F6EC",
                    color: t.priority === "High" ? "var(--danger)" : t.priority === "Medium" ? "var(--accent-dark)" : "var(--success)"
                  }}>
                    {t.priority}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.date}</span>
                </div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: 13.5, fontWeight: 600 }}>{t.title}</h4>
                {t.desc && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{t.desc}</p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                <button 
                  className="btn danger" 
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => handleDelete(t.id)}
                >
                  Delete
                </button>
                <div style={{ display: "flex", gap: 4 }}>
                  {colName !== "todo" && (
                    <button 
                      className="btn secondary" 
                      style={{ padding: "4px 8px", fontSize: 10 }}
                      onClick={() => {
                        const target = colName === "done" ? "in_progress" : "todo";
                        moveTask(t.id, target);
                      }}
                    >
                      ◀
                    </button>
                  )}
                  {colName !== "done" && (
                    <button 
                      className="btn secondary" 
                      style={{ padding: "4px 8px", fontSize: 10 }}
                      onClick={() => {
                        const target = colName === "todo" ? "in_progress" : "done";
                        moveTask(t.id, target);
                      }}
                    >
                      ▶
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Taskflow Kanban Board</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Organize and schedule your modules, homework exercises, and interview timelines.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleCreateTask}>
            <h3>Create New Task</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Review lecture..."
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  className="form-input" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Optional details..."
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)} 
                />
              </div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: 8 }}>
              Save Task
            </button>
          </form>
        </div>
      )}

      {/* Kanban Columns Grid */}
      <div className="kanban-board">
        {renderColumn("todo", "To Do")}
        {renderColumn("in_progress", "In Progress")}
        {renderColumn("done", "Completed")}
      </div>
    </div>
  );
}
