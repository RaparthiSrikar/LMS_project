import { useEffect, useState } from "react";
import client from "../api/client";

export default function MyJourney() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/students/enrollments/")
      .then((r) => setEnrollments(r.data.results ?? r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.is_completed || e.progress_percent >= 100).length;
  const averageProgress = totalCourses > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress_percent, 0) / totalCourses)
    : 0;

  const milestones = [
    {
      title: "Enrollment & Orientation",
      desc: "Successfully registered and onboarding completed.",
      completed: true,
      date: "Day 1",
    },
    {
      title: "First Course Progress",
      desc: "Start learning lectures, coding lessons, and submit exercises.",
      completed: totalCourses > 0,
      active: totalCourses > 0 && completedCourses === 0,
      date: totalCourses > 0 ? "In Progress" : "Pending Enrollment",
      detail: totalCourses > 0 ? `Enrolled in ${totalCourses} course(s). Average Progress: ${averageProgress}%.` : null
    },
    {
      title: "Midterm Milestones",
      desc: "Submit midterm assignments and clear topic assessments/quizzes.",
      completed: completedCourses > 0 || averageProgress > 50,
      active: totalCourses > 0 && completedCourses === 0 && averageProgress <= 50,
      date: "Milestone 2",
    },
    {
      title: "Capstone Projects & Code Labs",
      desc: "Build comprehensive projects and run scripts in the Playground.",
      completed: completedCourses > 0 && averageProgress === 100,
      active: completedCourses > 0 || averageProgress > 50,
      date: "Milestone 3",
    },
    {
      title: "Placement Readiness (Career Prep)",
      desc: "Prepare resumes, complete Mock Interviews and submit job applications.",
      completed: false,
      active: completedCourses > 0,
      date: "Career Phase",
    },
    {
      title: "Graduation & Industry Placement",
      desc: "Graduate with honors and transition to full-time roles or internships.",
      completed: false,
      active: false,
      date: "Final Stage",
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>My Learning Journey</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
        Follow your dynamic pathway checkpoints. Complete courses and pass quizzes to unlock milestones.
      </p>

      {loading ? (
        <div>Loading your roadmap details...</div>
      ) : (
        <div className="journey-timeline">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`journey-node ${m.completed ? "completed" : ""} ${m.active ? "active" : ""}`}
            >
              <div className="journey-marker" />
              <div className="journey-content" style={{ borderLeft: m.completed ? "4px solid var(--success)" : m.active ? "4px solid var(--accent)" : "4px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: m.completed ? "var(--success)" : m.active ? "var(--text)" : "var(--text-muted)" }}>
                    {m.title}
                  </h4>
                  <span className="badge" style={{ background: m.completed ? "#E5F6EC" : m.active ? "#FEF3E6" : "#EEF0F8", color: m.completed ? "var(--success)" : m.active ? "var(--accent)" : "var(--text-muted)" }}>
                    {m.date}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {m.desc}
                </p>
                {m.detail && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                    ℹ️ {m.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
