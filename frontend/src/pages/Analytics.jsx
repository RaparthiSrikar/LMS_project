import { useState } from "react";

export default function Analytics() {
  const [courseCompletion] = useState([
    { name: "React Beginners", rate: 82 },
    { name: "Django Advanced", rate: 64 },
    { name: "Python Core", rate: 94 },
    { name: "Web Security", rate: 45 }
  ]);

  const [enrollmentGrowth] = useState([
    { month: "Jan", count: 120 },
    { month: "Feb", count: 180 },
    { month: "Mar", count: 240 },
    { month: "Apr", count: 310 },
    { month: "May", count: 450 },
    { month: "Jun", count: 520 }
  ]);

  const [activeDays] = useState([
    { day: "Mon", count: 320 },
    { day: "Tue", count: 410 },
    { day: "Wed", count: 390 },
    { day: "Thu", count: 480 },
    { day: "Fri", count: 420 },
    { day: "Sat", count: 180 },
    { day: "Sun", count: 150 }
  ]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Performance Analytics</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Analyze course completion ratios, active weekday learning trends, and student database growth records.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Course Completion Rates */}
        <div className="card" style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Course Completion Rates</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {courseCompletion.map((c) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: "var(--text-muted)" }}>{c.rate}% completion</span>
                </div>
                <div style={{ width: "100%", background: "#f1f5f9", height: 10, borderRadius: 5, overflow: "hidden" }}>
                  <div 
                    style={{ 
                      width: `${c.rate}%`, 
                      background: c.rate > 80 ? "var(--success)" : c.rate > 50 ? "var(--accent)" : "var(--danger)", 
                      height: "100%",
                      borderRadius: 5
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Enrollment Growth */}
        <div className="card" style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Monthly Enrollment Volume</h3>
          <div style={{ display: "flex", alignItems: "flex-end", justify: "space-between", height: 180, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
            {enrollmentGrowth.map((g) => {
              const heightPercent = (g.count / 550) * 100;
              return (
                <div key={g.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{g.count}</div>
                  <div 
                    style={{ 
                      width: 24, 
                      height: `${heightPercent}%`, 
                      background: "var(--accent)", 
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.5s ease"
                    }} 
                  />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{g.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekday Engagement Activity */}
      <div className="card" style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Daily Active Student Logins</h3>
        <div style={{ display: "flex", alignItems: "flex-end", justify: "space-between", height: 200, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
          {activeDays.map((a) => {
            const heightPercent = (a.count / 500) * 100;
            return (
              <div key={a.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{a.count}</div>
                <div 
                  style={{ 
                    width: 32, 
                    height: `${heightPercent}%`, 
                    background: a.day === "Sat" || a.day === "Sun" ? "#cbd5e1" : "#1e293b", 
                    borderRadius: "4px 4px 0 0"
                  }} 
                />
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginTop: 4 }}>{a.day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}export { Analytics };
