import { useEffect, useState } from "react";
import client from "../api/client";

export default function OtherCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        client.get("/courses/courses/"),
        client.get("/students/enrollments/")
      ]);
      setCourses(coursesRes.data.results ?? coursesRes.data);
      setEnrollments(enrollmentsRes.data.results ?? enrollmentsRes.data);
    } catch (e) {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrolledCourseIds = new Set(enrollments.map(e => e.course));

  const availableCourses = courses.filter(c => !enrolledCourseIds.has(c.id));

  const filteredCourses = availableCourses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevel === "all" || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEnroll = async (courseId) => {
    setError("");
    setSuccess("");
    try {
      await client.post("/students/enrollments/", { course: courseId });
      setSuccess("Successfully enrolled in the course!");
      // Reload details
      loadData();
    } catch (e) {
      setError(e.response?.data?.detail ?? "Failed to enroll in the course.");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Explore Other Courses</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Find your next learning path and register in one click.
          </p>
        </div>
      </div>

      {success && <div className="badge success" style={{ padding: "10px 16px", marginBottom: 20, width: "100%", borderRadius: 8, fontSize: 13 }}>✓ {success}</div>}
      {error && <div className="badge danger" style={{ padding: "10px 16px", marginBottom: 20, width: "100%", borderRadius: 8, fontSize: 13 }}>✗ {error}</div>}

      {/* Filter and Search controls */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <input 
          type="text" 
          placeholder="Search courses..." 
          className="form-input" 
          style={{ width: "100%", maxWidth: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "beginner", "intermediate", "advanced"].map(lvl => (
            <button 
              key={lvl} 
              className={`btn ${selectedLevel === lvl ? "" : "secondary"}`}
              style={{ textTransform: "capitalize", padding: "6px 12px", fontSize: 12 }}
              onClick={() => setSelectedLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div>Loading available courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <h3>No courses found</h3>
          <p>You have enrolled in all available courses, or none match your filter preferences.</p>
        </div>
      ) : (
        <div className="grid-container">
          {filteredCourses.map(course => (
            <div key={course.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <span className="badge success" style={{ textTransform: "uppercase", fontSize: 10 }}>{course.level}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: 12 }}>
                    ⏱ {course.duration_weeks} Weeks
                  </span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{course.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4, margin: "0 0 16px 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {course.description || "No description provided."}
                </p>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Price</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                      {course.final_price > 0 ? `$${course.final_price}` : "Free"}
                    </span>
                    {course.discount_percent > 0 && (
                      <span style={{ fontSize: 11, textDecoration: "line-through", color: "var(--text-muted)", marginLeft: 6 }}>
                        ${course.price}
                      </span>
                    )}
                  </div>
                  {course.discount_percent > 0 && (
                    <span className="badge" style={{ background: "#FFEBEB", color: "var(--danger)", fontWeight: 700, fontSize: 11 }}>
                      {course.discount_percent}% OFF
                    </span>
                  )}
                </div>

                <button 
                  className="btn" 
                  style={{ width: "100%" }}
                  onClick={() => handleEnroll(course.id)}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
