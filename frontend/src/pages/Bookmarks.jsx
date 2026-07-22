import { useEffect, useState } from "react";

const INITIAL_BOOKMARKS = [];

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("student_bookmarks");
    if (stored) {
      setBookmarks(JSON.parse(stored));
    } else {
      setBookmarks(INITIAL_BOOKMARKS);
      localStorage.setItem("student_bookmarks", JSON.stringify(INITIAL_BOOKMARKS));
    }
  }, []);

  const saveBookmarks = (newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem("student_bookmarks", JSON.stringify(newBookmarks));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !url) return;
    
    // Add protocol if missing
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = "https://" + url;
    }

    const newBk = {
      id: Date.now(),
      title,
      url: formattedUrl,
      category: category || "General",
      date: new Date().toISOString().split('T')[0]
    };

    saveBookmarks([newBk, ...bookmarks]);
    setTitle("");
    setUrl("");
    setCategory("General");
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const categories = ["all", ...new Set(bookmarks.map(b => b.category))];

  const filteredBookmarks = activeFilter === "all" 
    ? bookmarks 
    : bookmarks.filter(b => b.category === activeFilter);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Bookmarks Manager</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Keep track of references, documentation links, and learning guides.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Bookmark"}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleAdd}>
            <h3>Add New Bookmark</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
              <div className="form-group">
                <label>Resource Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. React Docs"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>URL</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. react.dev"
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category Tag</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. React, Python, CSS"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                />
              </div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: 8 }}>
              Save Bookmark
            </button>
          </form>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="tabs">
        {categories.map(cat => (
          <div 
            key={cat} 
            className={`tab ${activeFilter === cat ? "active" : ""}`}
            style={{ textTransform: "capitalize" }}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <p>No bookmarks found for "{activeFilter}". Add one above to get started!</p>
        </div>
      ) : (
        <div className="grid-container">
          {filteredBookmarks.map(b => (
            <div key={b.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <span className="badge" style={{ background: "#EEF0F8", color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase" }}>
                    {b.category}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.date}</span>
                </div>
                <h3 style={{ fontSize: 15, margin: "0 0 8px 0", lineHeight: 1.3, fontWeight: 600 }}>{b.title}</h3>
                <a 
                  href={b.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: 12, color: "#1b75ff", wordBreak: "break-all", display: "inline-block" }}
                >
                  🔗 {b.url.replace(/^https?:\/\//i, "")}
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <button 
                  className="btn danger" 
                  style={{ padding: "4px 10px", fontSize: 11 }}
                  onClick={() => handleDelete(b.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
