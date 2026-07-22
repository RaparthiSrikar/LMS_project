import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.first_name || "Alex",
    lastName: user?.last_name || "Morgan",
    title: "Senior Full-Stack Architect",
    bio: "Senior software engineer with 10+ years of building production-ready architectures. Passionate about React, Django, and mentoring developers.",
    experience: "10 Years of Industry Engineering",
    skills: "React, Node.js, Python, Django, PostgreSQL, Docker, AWS",
    education: "M.S. in Computer Science - Stanford University",
    certifications: "AWS Certified Solution Architect, Google Professional Cloud Developer",
    twitter: "https://twitter.com/trainer",
    linkedin: "https://linkedin.com/in/trainer"
  });

  const [editMode, setEditMode] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setAlertMsg("Profile updated successfully!");
    setEditMode(false);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2>My Profile</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Manage your professional details, social presence, skills, and certifications.
          </p>
        </div>
        <button className="btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {alertMsg && (
        <div style={{ background: "#e6f7ff", border: "1px solid #91d5ff", color: "var(--accent)", padding: 12, borderRadius: 8, marginBottom: 20, textAlign: "center", fontSize: 13 }}>
          {alertMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {editMode ? (
          <div className="card" style={{ background: "#fff", padding: 24 }}>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    className="form-input" 
                    value={profile.firstName} 
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    className="form-input" 
                    value={profile.lastName} 
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Professional Title</label>
                  <input 
                    className="form-input" 
                    value={profile.title} 
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input 
                    className="form-input" 
                    value={profile.experience} 
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Biography</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  value={profile.bio} 
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input 
                    className="form-input" 
                    value={profile.skills} 
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Education</label>
                  <input 
                    className="form-input" 
                    value={profile.education} 
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Certifications</label>
                  <input 
                    className="form-input" 
                    value={profile.certifications} 
                    onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn Link</label>
                  <input 
                    className="form-input" 
                    value={profile.linkedin} 
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn" type="submit">Save Profile</button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ background: "#fff", padding: 32, display: "flex", flexDirection: "column", gap: 24, textAlign: "left" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", color: "#1B1200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>
                {profile.firstName[0]}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>{profile.firstName} {profile.lastName}</h3>
                <div style={{ color: "var(--accent)", fontSize: 14, fontWeight: 500, marginTop: 4 }}>{profile.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Role: Instructor · Email: {user?.email}</div>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>About Me</h4>
              <p style={{ color: "var(--text-main)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <h4 style={{ margin: "0 0 6px 0" }}>Skills & Tech Stack</h4>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {profile.skills.split(",").map(sk => (
                    <span key={sk} className="badge" style={{ background: "#f1f5f9", color: "#1e293b", fontSize: 11 }}>
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ margin: "0 0 6px 0" }}>Experience</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>{profile.experience}</p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 6px 0" }}>Education</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>{profile.education}</p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 6px 0" }}>Certifications</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>{profile.certifications}</p>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            <div>
              <h4 style={{ margin: "0 0 10px 0" }}>Connect & Social</h4>
              <div style={{ display: "flex", gap: 12 }}>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn secondary" style={{ textDecoration: "none", fontSize: 12, padding: "6px 12px" }}>
                  🔗 LinkedIn Profile
                </a>
                <a href={profile.twitter} target="_blank" rel="noreferrer" className="btn secondary" style={{ textDecoration: "none", fontSize: 12, padding: "6px 12px" }}>
                  🐦 Twitter Handle
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
