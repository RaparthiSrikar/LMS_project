import { useEffect, useState } from "react";

const INITIAL_NOTES = [];

export default function Notebook() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // Note Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("student_notes");
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotes(parsed);
      if (parsed.length > 0) {
        setSelectedNoteId(parsed[0].id);
        setTitle(parsed[0].title);
        setCategory(parsed[0].category);
        setContent(parsed[0].content);
      }
    } else {
      setNotes(INITIAL_NOTES);
      localStorage.setItem("student_notes", JSON.stringify(INITIAL_NOTES));
      setSelectedNoteId(INITIAL_NOTES[0].id);
      setTitle(INITIAL_NOTES[0].title);
      setCategory(INITIAL_NOTES[0].category);
      setContent(INITIAL_NOTES[0].content);
    }
  }, []);

  const handleSelectNote = (note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setCategory(note.category);
    setContent(note.content);
  };

  const handleUpdate = (updatedField, value) => {
    let uTitle = title;
    let uCategory = category;
    let uContent = content;

    if (updatedField === "title") {
      setTitle(value);
      uTitle = value;
    } else if (updatedField === "category") {
      setCategory(value);
      uCategory = value;
    } else if (updatedField === "content") {
      setContent(value);
      uContent = value;
    }

    const updatedNotes = notes.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: uTitle,
          category: uCategory,
          content: uContent,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    });

    setNotes(updatedNotes);
    localStorage.setItem("student_notes", JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      category: "General",
      content: "",
      updatedAt: new Date().toISOString()
    };

    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    localStorage.setItem("student_notes", JSON.stringify(newNotes));
    
    setSelectedNoteId(newNote.id);
    setTitle(newNote.title);
    setCategory(newNote.category);
    setContent(newNote.content);
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    const newNotes = notes.filter(n => n.id !== selectedNoteId);
    setNotes(newNotes);
    localStorage.setItem("student_notes", JSON.stringify(newNotes));

    if (newNotes.length > 0) {
      handleSelectNote(newNotes[0]);
    } else {
      setSelectedNoteId(null);
      setTitle("");
      setCategory("General");
      setContent("");
    }
  };

  const handleExportText = () => {
    if (!selectedNoteId) return;
    const noteText = `=== ${title} [${category}] ===\nLast Updated: ${new Date(notes.find(n => n.id === selectedNoteId).updatedAt).toLocaleString()}\n\n${content}`;
    const blob = new Blob([noteText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>My Learning Notebook</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Take quick study notes, organize by category, and download notes offline.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, height: "calc(100vh - 200px)", alignItems: "stretch" }}>
        {/* Left Side: Note List */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 12, overflowY: "auto" }}>
          <button className="btn" style={{ marginBottom: 12 }} onClick={handleCreateNote}>
            + New Note
          </button>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }}>
            {notes.map(n => (
              <div 
                key={n.id}
                onClick={() => handleSelectNote(n)}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  cursor: "pointer",
                  background: selectedNoteId === n.id ? "#e0ebff" : "transparent",
                  border: selectedNoteId === n.id ? "1px solid #1b75ff" : "1px solid transparent",
                  transition: "background 0.15s ease"
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {n.title || "Untitled"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, fontSize: 10, color: "var(--text-muted)" }}>
                  <span className="badge" style={{ padding: "1px 6px" }}>{n.category}</span>
                  <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Note Editor */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          {selectedNoteId ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontWeight: 600, fontSize: 16 }}
                  placeholder="Note Title..."
                  value={title}
                  onChange={(e) => handleUpdate("title", e.target.value)}
                />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ maxWidth: 160, fontSize: 13 }}
                  placeholder="Category..."
                  value={category}
                  onChange={(e) => handleUpdate("category", e.target.value)}
                />
              </div>

              <textarea 
                className="form-input" 
                style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, resize: "none", lineHeight: 1.5 }}
                placeholder="Start typing your study notes here..."
                value={content}
                onChange={(e) => handleUpdate("content", e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <button className="btn secondary" onClick={handleExportText}>
                  📥 Export Note
                </button>
                <button className="btn danger" onClick={handleDeleteNote}>
                  Delete Note
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              <h3>No note selected</h3>
              <p>Click "New Note" in the left sidebar panel to begin writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
