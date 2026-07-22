import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FiHome, FiUsers, FiBook, FiBriefcase, FiBarChart2, FiClipboard, FiHelpCircle, 
  FiCompass, FiBookmark, FiMessageSquare, FiEdit, FiTarget, FiFileText, FiCode, 
  FiCheckSquare, FiGift, FiCreditCard, FiVideo, FiRadio, FiBell, FiUser, FiSettings, FiGrid, FiLayers
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

const STUDENT_SECTIONS = [
  {
    title: "Core Learning",
    items: [
      { to: "/", label: "Home", icon: "home" },
      { to: "/my-journey", label: "My Journey", icon: "journey" },
      { to: "/assignments", label: "Assignments", icon: "assignments" },
      { to: "/quizzes", label: "Quizzes", icon: "quizzes" },
      { to: "/other-courses", label: "Other Courses", icon: "courses" },
    ],
  },
  {
    title: "Community & Notes",
    items: [
      { to: "/bookmarks", label: "Bookmarks", icon: "bookmarks" },
      { to: "/discussions", label: "My Discussions", icon: "discussions" },
      { to: "/notebook", label: "My Notebook", icon: "notebook" },
    ],
  },
  {
    title: "Practice & Placement",
    items: [
      { to: "/placement-prep", label: "Placement Prep..", icon: "placement" },
      { to: "/question-bank", label: "Question Bank", icon: "qbank" },
      { to: "/playground", label: "Playground", icon: "playground" },
      { to: "/code-snippets", label: "Code Snippets", icon: "snippets" },
    ],
  },
  {
    title: "Apps & Earnings",
    items: [
      { to: "/taskflow", label: "Taskflow", icon: "taskflow" },
      { to: "/invite-earn", label: "Invite and Earn", icon: "gift" },
      { to: "/payments", label: "Payments", icon: "payments" },
    ],
  },
];

const ADMIN_NAV = [
  { to: "/", label: "Dashboard", icon: "dashboard", roles: ["super_admin", "admin", "hr"] },
  { to: "/users", label: "Users", icon: "users", roles: ["super_admin", "admin"] },
  { to: "/courses", label: "Courses", icon: "courses", roles: ["super_admin", "admin", "trainer"] },
  { to: "/trainer-tools", label: "Trainer Tools", icon: "trainer", roles: ["trainer", "admin", "super_admin"] },
  { to: "/assignments", label: "Assignments", icon: "assignments", roles: ["trainer", "admin", "super_admin"] },
  { to: "/quizzes", label: "Quizzes", icon: "quizzes", roles: ["trainer", "admin", "super_admin"] },
  { to: "/reports", label: "Reports", icon: "reports", roles: ["admin", "super_admin", "hr", "trainer"] },
];

const TRAINER_NAV = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/courses", label: "Courses", icon: "courses" },
  { to: "/course-builder", label: "Course Builder", icon: "builder" },
  { to: "/notes", label: "Notes", icon: "notes" },
  { to: "/videos", label: "Videos", icon: "videos" },
  { to: "/assignments", label: "Assignments", icon: "assignments" },
  { to: "/live-sessions", label: "Live Sessions", icon: "live" },
  { to: "/students", label: "Students", icon: "students" },
  { to: "/analytics", label: "Analytics", icon: "analytics" },
  { to: "/announcements", label: "Announcements", icon: "announcements" },
  { to: "/messages", label: "Messages", icon: "messages" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/settings", label: "Settings", icon: "settings" }
];

function getIcon(name) {
  const size = 18;
  switch (name) {
    case "dashboard":
      return <FiGrid size={size} />;
    case "users":
      return <FiUsers size={size} />;
    case "courses":
      return <FiBook size={size} />;
    case "trainer":
      return <FiBriefcase size={size} />;
    case "reports":
      return <FiBarChart2 size={size} />;
    case "assignments":
      return <FiClipboard size={size} />;
    case "quizzes":
      return <FiHelpCircle size={size} />;
    case "home":
      return <FiHome size={size} />;
    case "journey":
      return <FiCompass size={size} />;
    case "bookmarks":
      return <FiBookmark size={size} />;
    case "discussions":
      return <FiMessageSquare size={size} />;
    case "notebook":
      return <FiEdit size={size} />;
    case "placement":
      return <FiTarget size={size} />;
    case "qbank":
      return <FiFileText size={size} />;
    case "jobs":
      return <FiBriefcase size={size} />;
    case "playground":
      return <FiCode size={size} />;
    case "snippets":
      return <FiCode size={size} />;
    case "taskflow":
      return <FiCheckSquare size={size} />;
    case "gift":
      return <FiGift size={size} />;
    case "payments":
      return <FiCreditCard size={size} />;
    case "builder":
      return <FiLayers size={size} />;
    case "notes":
      return <FiFileText size={size} />;
    case "videos":
      return <FiVideo size={size} />;
    case "live":
      return <FiRadio size={size} />;
    case "students":
      return <FiUsers size={size} />;
    case "analytics":
      return <FiBarChart2 size={size} />;
    case "announcements":
      return <FiBell size={size} />;
    case "messages":
      return <FiMessageSquare size={size} />;
    case "profile":
      return <FiUser size={size} />;
    case "settings":
      return <FiSettings size={size} />;
    default:
      return null;
  }
}


const getUserDisplayName = (u) => {
  if (!u) return "User";
  if (u.first_name) return u.first_name;
  if (typeof u.username === "string" && u.username.includes("@")) return u.username.split("@")[0];
  return u.username || u.email?.split("@")[0] || "User";
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile and paused learning states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [activeEnrollment, setActiveEnrollment] = useState(null);

  // Theme Switcher state
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  // Notification Bell state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Assignment Graded", text: "Your React & Django Integration submission has been evaluated.", date: "10 mins ago", read: false },
    { id: 2, title: "Upcoming Live Class", text: "Python Web Dev live session starts tomorrow at 10:00 AM.", date: "1 hour ago", read: false },
    { id: 3, title: "New Announcement", text: "Final semester quiz guidelines and schedules have been published.", date: "2 hours ago", read: true },
  ]);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const isStudent = user?.role === "student";
  const isTrainer = user?.role === "trainer";
  const nonStudentLinks = isTrainer 
    ? TRAINER_NAV 
    : ADMIN_NAV.filter((n) => n.roles.includes(user?.role));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (user && isStudent) {
      client.get("/students/enrollments/")
        .then((r) => {
          const list = r.data.results ?? r.data;
          const active = list.find(e => !e.is_completed) || list[0];
          setActiveEnrollment(active);
        })
        .catch(() => {});
    }
  }, [user, isStudent]);

  const handleSearchChange = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const [resC, resA] = await Promise.all([
        client.get(`/courses/courses/?search=${encodeURIComponent(q)}`),
        client.get(`/assignments/assignments/?search=${encodeURIComponent(q)}`)
      ]);
      const courses = (resC.data.results ?? resC.data).map(c => ({ ...c, type: "Course", link: "/courses" }));
      const assignments = (resA.data.results ?? resA.data).map(a => ({ ...a, type: "Assignment", link: "/assignments" }));
      setSearchResults([...courses, ...assignments].slice(0, 6));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Enterprise<span>LMS</span></div>
        <div className="sidebar-sub">Learning Management</div>

        <div className="sidebar-nav-container">
          {isStudent ? (
            STUDENT_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="sidebar-section-header">{section.title}</div>
                {section.items.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                  >
                    {getIcon(l.icon)}
                    <span>{l.label}</span>
                  </NavLink>
                ))}
              </div>
            ))
          ) : (
            nonStudentLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
              >
                {getIcon(l.icon)}
                <span>{l.label}</span>
              </NavLink>
            ))
          )}
        </div>

        <div className="sidebar-footer" style={{ position: "relative" }}>
          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div 
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                left: 12,
                right: 12,
                background: "var(--sidebar-hover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                padding: "8px 0",
                zIndex: 1000
              }}
            >
              <button
                className="sidebar-link"
                style={{ width: "100%", border: "none", background: "none", cursor: "pointer", color: "#C6CAEA", textAlign: "left", padding: "8px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}
                onClick={() => {
                  setShowProfileModal(true);
                  setShowProfileMenu(false);
                }}
              >
                👤 My Profile
              </button>
              {user?.role === "student" && activeEnrollment && (
                <button
                  className="sidebar-link"
                  style={{ width: "100%", border: "none", background: "none", cursor: "pointer", color: "#C6CAEA", textAlign: "left", padding: "8px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}
                  onClick={() => {
                    setShowPauseModal(true);
                    setShowProfileMenu(false);
                  }}
                >
                  {activeEnrollment.is_paused ? "▶ Resume Learning" : "⏸ Pause Learning"}
                </button>
              )}
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <button
                className="sidebar-link"
                style={{ width: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--danger)", textAlign: "left", padding: "8px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                🚪 Log Out
              </button>
            </div>
          )}

          {/* Profile Selector Button */}
          <div 
            onClick={() => setShowProfileMenu(prev => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 8,
              background: showProfileMenu ? "var(--sidebar-hover)" : "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#1B1200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {getUserDisplayName(user)}
                </div>

                <div style={{ fontSize: 11, color: "#C6CAEA", textTransform: "capitalize" }}>
                  {user?.role?.replace("_", " ")}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#C6CAEA" }}>{showProfileMenu ? "▲" : "▼"}</span>
          </div>
        </div>
      </aside>

      <div className="main-area">
        {/* Topbar Header with Global Search, Notifications, and Theme Switcher */}
        <div className="topbar">
          {/* Global Header Search Bar */}
          <div style={{ position: "relative", width: 320 }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ color: "var(--text-muted)", marginRight: 8, fontSize: 14 }}>🔍</span>
              <input 
                type="text"
                placeholder="Search courses, assignments..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--text)",
                  width: "100%",
                  fontSize: 13
                }}
              />
              {searchQuery && (
                <button 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12 }}
                  onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {searchQuery && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                zIndex: 2500,
                maxHeight: 280,
                overflowY: "auto",
                padding: "8px 0"
              }}>
                {searching ? (
                  <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>No matches found for "{searchQuery}"</div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        navigate(item.link);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                        borderBottom: "1px solid var(--border)",
                        textAlign: "left"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.title || item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.type}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--accent)" }}>Go →</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Theme Toggle Button (Dark / Light) */}
            <button 
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
                color: "var(--text)"
              }}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Notification Bell Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowNotifications(prev => !prev)}
                title="Notifications"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "var(--text)",
                  position: "relative"
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    background: "var(--danger)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 320,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  zIndex: 2500,
                  padding: "12px 0",
                  textAlign: "left"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid var(--border)",
                          background: n.read ? "transparent" : "var(--bg)",
                          opacity: n.read ? 0.8 : 1
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>{n.title}</span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{n.date}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>
                          {n.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Greeting */}
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}
            </div>
          </div>
        </div>

        <div className="content">{children}</div>
      </div>


      {/* My Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 450, padding: 24, background: "var(--surface)", position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setShowProfileModal(false)}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 20px 0", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>Profile Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", fontSize: 11, textTransform: "uppercase" }}>Full Name</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  {getUserDisplayName(user)}
                </span>

              </div>
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", fontSize: 11, textTransform: "uppercase" }}>Email Address</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{user?.email}</span>
              </div>
              {user?.phone && (
                <div>
                  <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", fontSize: 11, textTransform: "uppercase" }}>Phone</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{user.phone}</span>
                </div>
              )}
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", fontSize: 11, textTransform: "uppercase" }}>Account Role</span>
                <span className="badge" style={{ textTransform: "capitalize" }}>{user?.role?.replace("_", " ")}</span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", fontSize: 11, textTransform: "uppercase" }}>Member Since</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Learning Modal */}
      {showPauseModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 400, padding: 24, background: "var(--surface)", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 12px 0" }}>
              {activeEnrollment?.is_paused ? "Resume Learning?" : "Pause Learning?"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              {activeEnrollment?.is_paused 
                ? "Are you ready to resume your classes? Your daily class calendar will be re-enabled."
                : "Are you sure you want to pause your learning? This will temporarily suspend access to class timelines and daily scheduling."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button 
                className="btn secondary" 
                onClick={() => setShowPauseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                style={{ background: activeEnrollment?.is_paused ? "var(--success)" : "var(--accent)" }}
                onClick={handleTogglePause}
              >
                {activeEnrollment?.is_paused ? "Resume Now" : "Pause Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

