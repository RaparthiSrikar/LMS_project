import { useEffect, useState } from "react";

const INITIAL_THREADS = [];

export default function Discussions() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("React");
  const [newContent, setNewContent] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("student_discussions");
    if (stored) {
      setThreads(JSON.parse(stored));
    } else {
      setThreads(INITIAL_THREADS);
      localStorage.setItem("student_discussions", JSON.stringify(INITIAL_THREADS));
    }
  }, []);

  const saveThreads = (newThreads) => {
    setThreads(newThreads);
    localStorage.setItem("student_discussions", JSON.stringify(newThreads));
    if (selectedThread) {
      const updatedSelected = newThreads.find(t => t.id === selectedThread.id);
      setSelectedThread(updatedSelected);
    }
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newTh = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      author: "Me (Student)",
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      comments: []
    };

    saveThreads([newTh, ...threads]);
    setNewTitle("");
    setNewContent("");
    setShowAddForm(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedThread) return;

    const newComment = {
      id: Date.now(),
      author: "Me (Student)",
      content: newCommentText,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedThreads = threads.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    });

    saveThreads(updatedThreads);
    setNewCommentText("");
  };

  if (selectedThread) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <button 
          className="btn secondary" 
          style={{ marginBottom: 20 }}
          onClick={() => setSelectedThread(null)}
        >
          ← Back to Discussions
        </button>

        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="badge" style={{ background: "#EEF0F8", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase" }}>{selectedThread.category}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Posted on {selectedThread.date} by <strong>{selectedThread.author}</strong></span>
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>{selectedThread.title}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedThread.content}</p>
        </div>

        <h3 style={{ marginBottom: 16 }}>Comments ({selectedThread.comments.length})</h3>

        {selectedThread.comments.length === 0 ? (
          <div className="card" style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", marginBottom: 24 }}>
            No comments yet. Be the first to answer!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {selectedThread.comments.map(c => (
              <div key={c.id} className="card" style={{ padding: 16, background: "#fdfdfd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  <strong>{c.author}</strong>
                  <span>{c.date}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h4>Post a Reply</h4>
          <form onSubmit={handleAddComment} style={{ marginTop: 12 }}>
            <div className="form-group">
              <textarea 
                className="form-input" 
                rows={4} 
                placeholder="Type your reply here..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit">Submit Reply</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="toolbar">
        <div>
          <h2>Discussion Board</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Discuss courses, assignments, code syntax errors, and share answers.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New Thread"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Create New Discussion Thread</h3>
          <form onSubmit={handleCreateThread} style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Thread Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter a descriptive topic title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                className="form-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="React">React</option>
                <option value="Django">Django</option>
                <option value="Database">Database</option>
                <option value="Python">Python</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Topic Content</label>
              <textarea 
                className="form-input" 
                rows={5} 
                placeholder="Describe your issue or question in detail..."
                value={newContent}
                onChange={(newE) => setNewContent(newE.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit">Publish Thread</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {threads.map(t => (
          <div 
            key={t.id} 
            className="card" 
            style={{ padding: 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onClick={() => setSelectedThread(t)}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="badge" style={{ background: "#EEF0F8", color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase" }}>{t.category}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Posted by {t.author} · {t.date}</span>
            </div>
            <h3 style={{ fontSize: 16, margin: "0 0 8px 0" }}>{t.title}</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {t.content}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
              <span>💬 {t.comments.length} replies</span>
              <span style={{ color: "#1b75ff", fontWeight: 600 }}>Join Discussion →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
