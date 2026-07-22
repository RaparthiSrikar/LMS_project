import { useState } from "react";

export default function Messages() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", avatar: "A", unread: true, lastMsg: "Could you review my submission for task 2?" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", avatar: "B", unread: false, lastMsg: "Thank you for the guidance!" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", avatar: "C", unread: false, lastMsg: "Will there be a live session tomorrow?" }
  ]);

  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [conversations, setConversations] = useState({
    1: [
      { id: 101, sender: "student", text: "Hello instructor, I am struggling with absolute path definitions in React routing.", time: "10:15 AM" },
      { id: 102, sender: "trainer", text: "Hi Alice, remember to prefix path references with absolute '/' signs to prevent relative component chaining.", time: "10:18 AM" },
      { id: 103, sender: "student", text: "Could you review my submission for task 2?", time: "11:20 AM" }
    ],
    2: [
      { id: 201, sender: "student", text: "The database models run migrations correctly now.", time: "Yesterday" },
      { id: 202, sender: "trainer", text: "Excellent! Let me know if you run into serializer issues.", time: "Yesterday" },
      { id: 203, sender: "student", text: "Thank you for the guidance!", time: "Yesterday" }
    ],
    3: [
      { id: 301, sender: "student", text: "Will there be a live session tomorrow?", time: "2 days ago" },
      { id: 302, sender: "trainer", text: "Yes, Charlie. I will publish the scheduled zoom meeting invitation to the board today.", time: "2 days ago" }
    ]
  });

  const [newMsg, setNewMsg] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeContact) return;

    const msgObj = {
      id: Date.now(),
      sender: "trainer",
      text: newMsg,
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setConversations({
      ...conversations,
      [activeContact.id]: [...(conversations[activeContact.id] || []), msgObj]
    });

    // Mark as read and update last message
    setContacts(contacts.map(c => 
      c.id === activeContact.id ? { ...c, unread: false, lastMsg: newMsg } : c
    ));

    setNewMsg("");
  };

  const handleSelectContact = (c) => {
    setActiveContact(c);
    setContacts(contacts.map(item => 
      item.id === c.id ? { ...item, unread: false } : item
    ));
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", height: "calc(100vh - 160px)" }}>
      <div className="card" style={{ display: "grid", gridTemplateColumns: "300px 1fr", height: "100%", padding: 0, overflow: "hidden", background: "#fff" }}>
        
        {/* Left column: Contacts */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontWeight: 600, textAlign: "left" }}>
            Student Messages
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {contacts.map((c) => (
              <div 
                key={c.id} 
                onClick={() => handleSelectContact(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  background: activeContact?.id === c.id ? "#f8f9fc" : "transparent"
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "#1B1200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: c.unread ? 700 : 500, fontSize: 13 }}>{c.name}</span>
                    {c.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", marginTop: 4 }}>
                    {c.lastMsg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Conversation Box */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f8f9fc" }}>
          {activeContact ? (
            <>
              <div style={{ padding: 16, background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", justify: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{activeContact.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{activeContact.email}</div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {(conversations[activeContact.id] || []).map((msg) => {
                  const isTrainer = msg.sender === "trainer";
                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        alignSelf: isTrainer ? "flex-end" : "flex-start", 
                        maxWidth: "70%",
                        textAlign: "left"
                      }}
                    >
                      <div 
                        style={{ 
                          background: isTrainer ? "#1e293b" : "#fff", 
                          color: isTrainer ? "#fff" : "var(--text-main)", 
                          padding: "10px 14px", 
                          borderRadius: isTrainer ? "12px 12px 0 12px" : "12px 12px 12px 0",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          fontSize: 13
                        }}
                      >
                        {msg.text}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, textAlign: isTrainer ? "right" : "left" }}>
                        {msg.time}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} style={{ padding: 16, background: "#fff", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <input 
                  className="form-input" 
                  style={{ margin: 0, flex: 1 }} 
                  placeholder="Type a response..."
                  value={newMsg} 
                  onChange={(e) => setNewMsg(e.target.value)}
                  required
                />
                <button className="btn" type="submit">Send</button>
              </form>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              Select a conversation to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
