import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaGraduationCap, 
  FaChalkboardUser, 
  FaMoneyBillWave, 
  FaBookOpen, 
  FaFileLines, 
  FaChartLine, 
  FaBullseye, 
  FaKey, 
  FaBolt 
} from "react-icons/fa6";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const ADMIN_CARDS_CONFIG = [
  { key: "total_students", label: "Total Students", icon: <FaGraduationCap />, color: "#3b82f6", bg: "#eff6ff", sub: "Registered learners" },
  { key: "total_trainers", label: "Total Trainers", icon: <FaChalkboardUser />, color: "#8b5cf6", bg: "#f5f3ff", sub: "Active instructors" },
  { key: "total_revenue", label: "Total Revenue", icon: <FaMoneyBillWave />, color: "#10b981", bg: "#ecfdf5", sub: "Successful payments", format: (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  { key: "active_courses", label: "Active Courses", icon: <FaBookOpen />, color: "#f59e0b", bg: "#fffbeb", sub: "Published curriculum" },
  { key: "pending_assignments", label: "Pending Assignments", icon: <FaFileLines />, color: "#ef4444", bg: "#fef2f2", sub: "Awaiting evaluation" },
  { key: "student_growth_30d", label: "Student Growth", icon: <FaChartLine />, color: "#06b6d4", bg: "#ecfeff", sub: "New students (30 days)" },
  { key: "course_completion_rate", label: "Course Completion", icon: <FaBullseye />, color: "#6366f1", bg: "#eef2ff", sub: "Avg completion rate", format: (v) => `${v}%` },
  { key: "daily_logins", label: "Daily Logins", icon: <FaKey />, color: "#14b8a6", bg: "#f0fdf4", sub: "Logins today" },
  { key: "active_users", label: "Active Users", icon: <FaBolt />, color: "#ec4899", bg: "#fdf2f8", sub: "Enabled accounts" },
];



const getUserDisplayName = (u) => {
  if (!u) return "User";
  if (u.first_name) return u.first_name;
  if (typeof u.username === "string" && u.username.includes("@")) return u.username.split("@")[0];
  return u.username || u.email?.split("@")[0] || "User";
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dynamic Weekly Calendar States
  const [calendarData, setCalendarData] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);

  // Certificate States
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  // Admin & Trainer Schedule Calendar States
  const [adminCourses, setAdminCourses] = useState([]);
  const [selectedAdminCourseId, setSelectedAdminCourseId] = useState("");
  const [adminCalendarData, setAdminCalendarData] = useState(null);
  const [loadingAdminCalendar, setLoadingAdminCalendar] = useState(false);
  const [adminDayIndex, setAdminDayIndex] = useState(0);
  const [adminWeek, setAdminWeek] = useState(0);

  const handleViewCertificate = async (enrollmentId) => {

    setLoadingCertificate(true);
    try {
      const res = await client.get(`/students/enrollments/${enrollmentId}/certificate/`);
      setActiveCertificate(res.data);
    } catch {
      alert("Could not load certificate.");
    } finally {
      setLoadingCertificate(false);
    }
  };

  const isStudent = user?.role === "student";
  const isTrainer = user?.role === "trainer";

  useEffect(() => {
    if (isStudent) {
      setLoadingEnrollments(true);
      client.get("/students/enrollments/")
        .then((r) => {
          setEnrollments(r.data.results ?? r.data);
        })
        .catch(() => {})
        .finally(() => setLoadingEnrollments(false));

      setLoadingCalendar(true);
      client.get("/students/enrollments/calendar/")
        .then((r) => {
          setCalendarData(r.data);
          const todayIdx = r.data.days?.findIndex(d => d && d.is_today);
          if (todayIdx !== -1 && todayIdx !== undefined) {
            setSelectedDayIndex(todayIdx);
            setCurrentWeek(Math.floor(todayIdx / 7));
          } else {
            setSelectedDayIndex(0);
            setCurrentWeek(0);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCalendar(false));
    } else {
      // Admin or Trainer stats fetch
      if (isTrainer) {
        client.get("/dashboard/trainer/")
          .then((r) => setData(r.data))
          .catch(() => setData({}));
      } else {
        client.get("/dashboard/admin/")
          .then((r) => setData(r.data))
          .catch(() => setData({}));
      }

      // Load all courses list for the schedule viewer
      client.get("/courses/courses/")
        .then((r) => {
          const list = r.data.results ?? r.data;
          setAdminCourses(list);
          if (list.length > 0) {
            setSelectedAdminCourseId(list[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isStudent, isTrainer]);

  useEffect(() => {
    if (!isStudent && selectedAdminCourseId) {
      setLoadingAdminCalendar(true);
      client.get(`/students/enrollments/calendar/?course_id=${selectedAdminCourseId}`)
        .then((r) => {
          setAdminCalendarData(r.data);
          setAdminDayIndex(0);
          setAdminWeek(0);
        })
        .catch(() => {})
        .finally(() => setLoadingAdminCalendar(false));
    }
  }, [selectedAdminCourseId, isStudent]);

  const handlePlayVideo = async (cls) => {
    setActiveVideo(cls.url);
    if (!calendarData) return;
    
    try {
      await client.post("/students/video-progress/", {
        enrollment: calendarData.enrollment_id,
        video: cls.video_id,
        watched: true
      });
      const res = await client.get("/students/enrollments/calendar/");
      setCalendarData(res.data);
    } catch (e) {
      if (e.response?.data?.non_field_errors || e.response?.status === 400) {
        try {
          const searchRes = await client.get(`/students/video-progress/?enrollment=${calendarData.enrollment_id}&video=${cls.video_id}`);
          const progressRecord = searchRes.data.results?.[0] || searchRes.data?.[0];
          if (progressRecord && !progressRecord.watched) {
            await client.patch(`/students/video-progress/${progressRecord.id}/`, { watched: true });
            const res = await client.get("/students/enrollments/calendar/");
            setCalendarData(res.data);
          }
        } catch (err) {}
      }
    }
  };

  if (isStudent) {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.is_completed || e.progress_percent >= 100).length;
    const inProgressCourses = totalCourses - completedCourses;

    return (
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2>Welcome, {getUserDisplayName(user)}!</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          Here is an overview of your learning progress and daily schedules.
        </p>

        {calendarData?.is_paused && (
          <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "16px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, color: "#d48806", fontSize: 14 }}>Learning Journey Paused</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Your course learning and class schedules are currently paused. You can resume at any time from the Profile popup menu in the sidebar.
              </div>
            </div>
          </div>
        )}

        {/* Learning Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Calendar widget */}
            {loadingCalendar ? (
              <div className="card" style={{ padding: 20, textAlign: "center" }}>
                Loading your daily learning schedule...
              </div>
            ) : !calendarData || !calendarData.course_name || !calendarData.days || calendarData.days.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: 16 }}>📅 Daily Classes Calendar</h3>
                <p style={{ margin: 0, fontSize: 13 }}>You are not enrolled in any courses yet. Please enroll in a course to view your daily learning schedule!</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>📅 Daily Classes: {calendarData.course_name}</h3>
                  
                  {/* Week selector pagination */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button 
                      disabled={currentWeek === 0}
                      onClick={() => {
                        setCurrentWeek(prev => prev - 1);
                        setSelectedDayIndex(prev => Math.max(0, prev - 7));
                      }}
                      className="btn secondary"
                      style={{ padding: "4px 8px", fontSize: 12, minWidth: 32 }}
                    >
                      ◀
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Week {currentWeek + 1} of {calendarData.duration_weeks}</span>
                    <button 
                      disabled={currentWeek >= calendarData.duration_weeks - 1}
                      onClick={() => {
                        setCurrentWeek(prev => prev + 1);
                        setSelectedDayIndex(prev => Math.min(calendarData.days.length - 1, prev + 7));
                      }}
                      className="btn secondary"
                      style={{ padding: "4px 8px", fontSize: 12, minWidth: 32 }}
                    >
                      ▶
                    </button>
                  </div>
                </div>
                
                {/* Calendar Grid representing one week */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 16 }}>
                  {calendarData.days.slice(currentWeek * 7, (currentWeek + 1) * 7).map(day => {
                    if (!day) return null;
                    const realIndexInArray = calendarData.days.findIndex(d => d && d.date === day.date);
                    const isActive = selectedDayIndex === realIndexInArray;
                    const isToday = day.is_today;

                    return (
                      <div 
                        key={day.date}
                        onClick={() => setSelectedDayIndex(realIndexInArray)}
                        style={{
                          padding: "8px 2px",
                          borderRadius: 8,
                          cursor: "pointer",
                          textAlign: "center",
                          background: isActive ? "var(--accent)" : isToday ? "#e0ebff" : "var(--bg)",
                          border: isActive ? "1px solid var(--accent-dark)" : isToday ? "1.5px solid #1b75ff" : "1px solid var(--border)",
                          color: isActive ? "#1B1200" : "var(--text)",
                          transition: "all 0.15s ease",
                          fontWeight: isActive || isToday ? 600 : 500
                        }}
                      >
                        <div style={{ fontSize: 10, textTransform: "uppercase", opacity: isActive ? 0.9 : 0.7, marginBottom: 2 }}>
                          {day.day_name}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>
                          {day.date_num}
                        </div>
                        {isToday && !isActive && (
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1b75ff", margin: "2px auto 0 auto" }} />
                        )}
                      </div>
                    );
                  })}
                </div>



                {/* Day Schedule list */}
                {(() => {
                  const currentDay = calendarData.days?.[selectedDayIndex] || calendarData.days?.[0];
                  if (!currentDay) return null;

                  return (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-muted)", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                        <span>Schedule: {new Date(currentDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>{(currentDay.classes || []).length} Session(s)</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(!currentDay.classes || currentDay.classes.length === 0) ? (
                          <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>
                            No classes scheduled for this day.
                          </div>
                        ) : (
                          currentDay.classes.map(cls => (
                            <div 
                              key={cls.id}
                              style={{
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                padding: 12,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--surface)"
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                                  <span className={`badge ${
                                    cls.type === "Recorded" ? "success" : cls.type === "Live" ? "danger" : "secondary"
                                  }`} style={{ fontSize: 9, padding: "2px 6px" }}>
                                    {cls.type}
                                  </span>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                    ⏱ {cls.time}
                                  </span>
                                  {cls.watched && (
                                    <span style={{ color: "var(--success)", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
                                      ✓ Watched
                                    </span>
                                  )}
                                </div>
                                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{cls.title}</h4>
                              </div>

                              <div>
                                {cls.type === "Recorded" ? (
                                  <button 
                                    className="btn secondary" 
                                    style={{ padding: "4px 10px", fontSize: 11 }}
                                    onClick={() => handlePlayVideo(cls)}
                                  >
                                    Watch Recording
                                  </button>
                                ) : cls.type === "Live" ? (
                                  <a 
                                    href={cls.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn" 
                                    style={{ display: "inline-block", textDecoration: "none", padding: "4px 10px", fontSize: 11, background: "var(--danger)", color: "#fff", textAlign: "center" }}
                                  >
                                    Join Live
                                  </a>
                                ) : (
                                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                                    Scheduled
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Quick stats */}
            <div className="card-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card">
                <div className="stat-label">Enrolled Courses</div>
                <div className="stat-value">{totalCourses}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value" style={{ color: "var(--success)" }}>{completedCourses}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">In Progress</div>
                <div className="stat-value" style={{ color: "var(--accent)" }}>{inProgressCourses}</div>
              </div>
            </div>

            {/* Enrolled Courses list */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>My Courses</h3>
              
              {loadingEnrollments ? (
                <div>Loading your courses...</div>
              ) : enrollments.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>
                  <p style={{ margin: "0" }}>You are not enrolled in any courses yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {enrollments.map((e) => (
                    <div 
                      key={e.id} 
                      style={{ 
                        border: "1px solid var(--border)", 
                        borderRadius: 10, 
                        padding: 16, 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 12,
                        background: "var(--surface)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{e.course_name}</span>
                        <span className={`badge ${e.is_completed || e.progress_percent >= 100 ? "success" : ""}`}>
                          {e.is_completed || e.progress_percent >= 100 ? "Completed" : "In Progress"}
                        </span>
                      </div>
                      
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "var(--text-muted)" }}>
                          <span>Course Progress</span>
                          <span style={{ fontWeight: 600, color: "var(--text)" }}>{e.progress_percent}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                          <div 
                            style={{ 
                              height: "100%", 
                              width: `${e.progress_percent}%`, 
                              background: e.is_completed || e.progress_percent >= 100 ? "var(--success)" : "var(--accent)", 
                              borderRadius: 4,
                              transition: "width 0.4s ease"
                            }} 
                          />
                        </div>
                      </div>
                      
                      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                        <span>Enrolled on: {new Date(e.enrolled_at).toLocaleDateString()}</span>
                        <button 
                          className="btn"
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            background: e.is_completed || e.progress_percent >= 100 ? "var(--success)" : "var(--accent)",
                            color: "#fff"
                          }}
                          onClick={() => handleViewCertificate(e.id)}
                        >
                          🏆 Download Certificate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        {/* Official Printable Course Certificate Modal */}
        {activeCertificate && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 20 }}>
            <div 
              id="printable-certificate"
              style={{
                width: "100%",
                maxWidth: 750,
                background: "var(--surface)",
                borderRadius: 16,
                padding: 40,
                position: "relative",
                border: "12px solid #1e293b",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                textAlign: "center",
                color: "#1e293b",
                fontFamily: "'Georgia', serif"
              }}
            >
              <button 
                style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}
                onClick={() => setActiveCertificate(null)}
              >
                ✕
              </button>

              {/* Gold Crest */}
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏅</div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 4, color: "#d97706", fontWeight: 700 }}>
                Enterprise LMS Certification
              </div>
              <h2 style={{ fontSize: 26, fontFamily: "'Georgia', serif", margin: "10px 0 24px 0", color: "#0f172a", textTransform: "uppercase", letterSpacing: 2 }}>
                Certificate of Completion
              </h2>

              <p style={{ fontStyle: "italic", color: "#64748b", margin: 0, fontSize: 14 }}>
                This is proudly presented and awarded to
              </p>
              <h1 style={{ fontSize: 32, fontFamily: "'Georgia', serif", margin: "12px 0", color: "#1e1b4b", textDecoration: "underline", textDecorationColor: "#f59e0b" }}>
                {activeCertificate.student_name}
              </h1>

              <p style={{ fontStyle: "italic", color: "#64748b", margin: "0 0 16px 0", fontSize: 14, lineHeight: 1.6 }}>
                for successfully fulfilling all requirements and completing 100% of the professional course
              </p>
              
              <h3 style={{ fontSize: 22, color: "#0f172a", margin: "0 0 24px 0", fontFamily: "sans-serif", fontWeight: 700 }}>
                "{activeCertificate.course_name}"
              </h3>

              {/* Certificate Details Footer Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, borderTop: "2px dashed #cbd5e1", paddingTop: 20, marginTop: 20, textAlign: "center", fontSize: 12, fontFamily: "sans-serif" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{activeCertificate.issued_date}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Date Issued</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#d97706" }}>{activeCertificate.verification_code}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Verification ID</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{activeCertificate.trainer_name}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Authorized Instructor</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12 }}>
                <button 
                  className="btn secondary" 
                  onClick={() => setActiveCertificate(null)}
                >
                  Close
                </button>
                <button 
                  className="btn" 
                  style={{ background: "#0f172a", color: "#fff" }}
                  onClick={() => window.print()}
                >
                  🖨 Print / Save Certificate PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {activeVideo && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
            <div className="card" style={{ width: "90%", maxWidth: 700, padding: 12, background: "#111", border: "none", position: "relative" }}>
              <button 
                style={{ position: "absolute", right: 10, top: 10, background: "var(--surface)", border: "none", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, zIndex: 10 }}

                onClick={() => setActiveVideo(null)}
              >
                ✕
              </button>
              <video 
                src={activeVideo} 
                controls 
                autoPlay 
                style={{ width: "100%", borderRadius: 6, display: "block" }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderAdminTrainerCalendar = () => {
    return (
      <div className="card" style={{ padding: 20, gridColumn: "1 / -1", marginTop: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            📅 Course Schedule Calendar: {adminCalendarData?.course_name || "Select Course"}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Course target:</span>
            <select 
              className="form-input" 
              style={{ width: 220, margin: 0 }}
              value={selectedAdminCourseId}
              onChange={(e) => setSelectedAdminCourseId(e.target.value)}
            >
              {adminCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {adminCourses.length === 0 && <option value="">No courses created</option>}
            </select>
          </div>
        </div>

        {loadingAdminCalendar ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Loading course schedule...
          </div>
        ) : !adminCalendarData || !adminCalendarData.days || adminCalendarData.days.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No schedule mapped for this course. Please schedule videos, notes, live classes, or assessments.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Week Selector Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                className="btn secondary" 
                style={{ padding: "4px 10px", fontSize: 12 }}
                disabled={adminWeek === 0}
                onClick={() => {
                  setAdminWeek(prev => prev - 1);
                  setAdminDayIndex(prev => prev - 7);
                }}
              >
                ◀ Previous Week
              </button>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Week {adminWeek + 1} of {adminCalendarData.duration_weeks}
              </span>
              <button 
                className="btn secondary" 
                style={{ padding: "4px 10px", fontSize: 12 }}
                disabled={adminWeek >= adminCalendarData.duration_weeks - 1}
                onClick={() => {
                  setAdminWeek(prev => prev + 1);
                  setAdminDayIndex(prev => prev + 7);
                }}
              >
                Next Week ▶
              </button>
            </div>

            {/* Weekly Calendar Horizontal Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {adminCalendarData.days.slice(adminWeek * 7, (adminWeek + 1) * 7).map(day => {
                const realIndex = adminCalendarData.days.findIndex(d => d.date === day.date);
                const isSelected = adminDayIndex === realIndex;
                return (
                  <div 
                    key={day.date}
                    onClick={() => setAdminDayIndex(realIndex)}
                    style={{
                      background: isSelected ? "var(--accent)" : "#f8f9fc",
                      color: isSelected ? "#1B1200" : "var(--text-main)",
                      border: "1px solid " + (isSelected ? "var(--accent)" : "var(--border)"),
                      borderRadius: 8,
                      padding: 10,
                      textAlign: "center",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.8 }}>{day.day_name}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, margin: "4px 0" }}>{day.date_num}</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>
                      {day.classes.length} class(es)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day content details */}
            {adminCalendarData.days[adminDayIndex] && (
              <div style={{ background: "#f8f9fc", padding: 16, borderRadius: 10, border: "1px solid var(--border)", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    Schedule Date: {new Date(adminCalendarData.days[adminDayIndex].date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)" }}>
                    {adminCalendarData.days[adminDayIndex].classes.length} Item(s) Scheduled
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {adminCalendarData.days[adminDayIndex].classes.length === 0 ? (
                    <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      No classes, notes, or assessments scheduled on this date.
                    </div>
                  ) : (
                    adminCalendarData.days[adminDayIndex].classes.map(cls => (
                      <div 
                        key={cls.id} 
                        style={{ 
                          background: "var(--surface)", 
                          padding: "12px 16px", 
                          borderRadius: 8, 
                          border: "1px solid var(--border)",
                          display: "flex",
                          justify: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                            <span 
                              className="badge" 
                              style={{ 
                                fontSize: 10, 
                                textTransform: "capitalize",
                                background: cls.type === "Recorded" ? "#e0f2fe" : cls.type === "Live" ? "#fee2e2" : cls.type === "Reading" ? "#fef3c7" : "#f1f5f9",
                                color: cls.type === "Recorded" ? "#0369a1" : cls.type === "Live" ? "#b91c1c" : cls.type === "Reading" ? "#b45309" : "inherit"
                              }}
                            >
                              {cls.type}
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{cls.title}</h4>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {cls.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    );
  };

  if (isTrainer) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 4 }}>Trainer Console</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          Welcome back, {user?.first_name || (user?.username?.includes("@") ? user.username.split("@")[0] : user?.username)}! Here is a summary of your courses and pending actions.
        </p>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
          <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="stat-label" style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>Courses Taught</div>
            <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.total_courses ?? 0}</div>
          </div>
          <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="stat-label" style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>Active Students</div>
            <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.active_students ?? 0}</div>
          </div>
          <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="stat-label" style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>Pending Evaluations</div>
            <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: (data?.pending_submissions > 0) ? "#f39c12" : "inherit" }}>
              {data?.pending_submissions ?? 0}
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="stat-label" style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>Live Sessions Scheduled</div>
            <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.upcoming_live_sessions ?? 0}</div>
          </div>
        </div>

        {/* Two-Column Task List */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Column 1: Pending Submissions */}
          <div className="card" style={{ padding: 24, background: "var(--surface)", borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Pending Submissions</h3>
            {!data?.pending_evaluations || data.pending_evaluations.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
                🎉 All student submissions are graded! Great work.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.pending_evaluations.map((sub) => (
                  <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8f9fc", borderRadius: 8, border: "1px solid #eef2f6" }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.student_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        {sub.assignment_title} · <span style={{ color: "var(--accent)" }}>{sub.course_name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Submitted: {new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button 
                      className="btn" 
                      style={{ padding: "6px 12px", fontSize: 12 }} 
                      onClick={() => navigate("/assignments")}
                    >
                      Grade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Upcoming Live Sessions */}
          <div className="card" style={{ padding: 24, background: "var(--surface)", borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Upcoming Live Meetings</h3>
            {!data?.live_sessions || data.live_sessions.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
                No meetings scheduled.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.live_sessions.map((ls) => (
                  <div key={ls.id} style={{ padding: 12, background: "#f8f9fc", borderRadius: 8, border: "1px solid #eef2f6", textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ls.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{ls.course_name}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", marginTop: 4 }}>
                      {new Date(ls.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {ls.meeting_link && (
                      <a 
                        href={ls.meeting_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn secondary" 
                        style={{ display: "inline-block", marginTop: 8, padding: "4px 10px", fontSize: 11, textAlign: "center", textDecoration: "none", width: "100%" }}
                      >
                        Join Meet
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderAdminTrainerCalendar()}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Admin Control Dashboard</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 13 }}>
            System aggregate analytics for <strong>{user?.email}</strong> ({user?.role?.replace("_", " ")})
          </p>
        </div>
        <button className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => window.location.reload()}>
          🔄 Refresh Metrics
        </button>
      </div>

      {/* 9 Admin Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 28 }}>
        {ADMIN_CARDS_CONFIG.map((card) => {
          const rawValue = data ? data[card.key] : null;
          const displayValue = data
            ? (card.format ? card.format(rawValue) : rawValue ?? 0)
            : "…";

          return (
            <div 
              key={card.key}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
              }}
            >
              {/* Icon Container */}
              <div 
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0
                }}
              >
                {card.icon}
              </div>

              {/* Text Info */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 2, lineHeight: 1.2 }}>
                  {displayValue}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 400 }}>
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {renderAdminTrainerCalendar()}
    </div>
  );
}

