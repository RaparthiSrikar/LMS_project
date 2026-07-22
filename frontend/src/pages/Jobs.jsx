import { useEffect, useState } from "react";

const JOBS_DATA = [
  {
    id: 101,
    title: "Junior React Frontend Developer",
    company: "Google Partner Team",
    location: "Bangalore, India",
    type: "Full-Time",
    salary: "$45,000 - $60,000",
    tags: ["React", "CSS", "TypeScript"],
    desc: "We are looking for a Junior React developer skilled in web systems, interactive hooks, and modern CSS/Tailwind layouts. You will be responsible for building responsive layouts and working alongside UI/UX designers."
  },
  {
    id: 102,
    title: "Django Backend Development Intern",
    company: "Stripe Integrations",
    location: "Remote, India",
    type: "Internship",
    salary: "$1,200 / Month",
    tags: ["Django", "Python", "REST API", "SQL"],
    desc: "Join our API integration teams writing clean Python/Django endpoints. You will work on designing serializers, writing database migration models, and implementing JWT authentication logic."
  },
  {
    id: 103,
    title: "Python Software Engineer",
    company: "Netflix Metrics",
    location: "Mumbai, India",
    type: "Full-Time",
    salary: "$80,000 - $110,000",
    tags: ["Python", "SQL", "Pandas", "Analytics"],
    desc: "Analyze usage metrics, design databases, and write scalable scripts. Candidate should have a solid foundation in Algorithms, Binary Trees lookup optimization, and SQL aggregates query optimization."
  }
];

export default function Jobs() {
  const [jobs] = useState(JOBS_DATA);
  const [appliedJobs, setAppliedJobs] = useState({}); // jobId -> dateApplied
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("student_applied_jobs");
    if (stored) {
      setAppliedJobs(JSON.parse(stored));
    }
  }, []);

  const handleApply = (id) => {
    const newApplied = {
      ...appliedJobs,
      [id]: new Date().toISOString().split('T')[0]
    };
    setAppliedJobs(newApplied);
    localStorage.setItem("student_applied_jobs", JSON.stringify(newApplied));
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = activeFilter === "all" || j.type.toLowerCase() === activeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Career Job Board</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Find full-time opportunities and internships tailored to your course stack.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <input 
          type="text" 
          placeholder="Search title, skills or company..." 
          className="form-input" 
          style={{ width: "100%", maxWidth: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "full-time", "internship"].map(t => (
            <button 
              key={t} 
              className={`btn ${activeFilter === t ? "" : "secondary"}`}
              style={{ textTransform: "capitalize", padding: "6px 12px", fontSize: 12 }}
              onClick={() => setActiveFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Jobs */}
      <div className="grid-container">
        {filteredJobs.map(j => {
          const isApplied = appliedJobs[j.id];

          return (
            <div key={j.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <span className="badge" style={{ background: j.type === "Full-Time" ? "#E0EBFF" : "#FEEBEB", color: j.type === "Full-Time" ? "#1b75ff" : "var(--danger)" }}>
                    {j.type}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>{j.salary}</span>
                </div>
                <h3 style={{ fontSize: 16, margin: "0 0 4px 0" }}>{j.title}</h3>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 12 }}>
                  🏢 {j.company} · 📍 {j.location}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {j.tags.map(t => (
                    <span key={t} className="badge" style={{ fontSize: 10, background: "#f1f3f9" }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <button 
                  className="btn secondary" 
                  style={{ flex: 1, padding: "8px 12px" }}
                  onClick={() => setSelectedJob(j)}
                >
                  View Details
                </button>
                {isApplied ? (
                  <button className="btn" style={{ flex: 1, padding: "8px 12px", background: "#E5F6EC", color: "var(--success)", cursor: "default" }} disabled>
                    ✓ Applied
                  </button>
                ) : (
                  <button 
                    className="btn" 
                    style={{ flex: 1, padding: "8px 12px" }}
                    onClick={() => handleApply(j.id)}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedJob && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 600, padding: 24, background: "#fff", position: "relative" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setSelectedJob(null)}
            >
              ✕
            </button>
            <div style={{ marginBottom: 14 }}>
              <span className="badge success" style={{ textTransform: "uppercase", fontSize: 10 }}>{selectedJob.type}</span>
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{selectedJob.title}</h2>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)", marginBottom: 16 }}>
              {selectedJob.company} · {selectedJob.location}
            </div>

            <h4 style={{ margin: "16px 0 6px 0" }}>Job Description</h4>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              {selectedJob.desc}
            </p>

            <h4 style={{ margin: "16px 0 6px 0" }}>Compensation</h4>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--success)" }}>{selectedJob.salary}</span>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <button className="btn secondary" onClick={() => setSelectedJob(null)}>Cancel</button>
              {appliedJobs[selectedJob.id] ? (
                <button className="btn" style={{ background: "#E5F6EC", color: "var(--success)" }} disabled>Applied</button>
              ) : (
                <button className="btn" onClick={() => handleApply(selectedJob.id)}>Confirm Application</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
