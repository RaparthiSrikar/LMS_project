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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [gateway, setGateway] = useState("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const handleEnrollClick = (course) => {
    if (course.final_price > 0) {
      setSelectedCourse(course);
      setGateway("stripe");
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
      setCouponSuccess("");
      setShowPaymentModal(true);
    } else {
      handleEnroll(course.id);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await client.post("/payments/coupons/validate/", { code: couponCode });
      setAppliedCoupon(res.data);
      setCouponSuccess(`Coupon "${res.data.code}" applied! (${res.data.discount_percent}% off)`);
    } catch (e) {
      setAppliedCoupon(null);
      setCouponError(e.response?.data?.detail ?? "Invalid or expired coupon.");
    }
  };

  const handlePayment = async () => {
    if (!selectedCourse) return;
    setPaymentLoading(true);
    setError("");
    setSuccess("");
    try {
      await client.post("/payments/payments/", {
        course: selectedCourse.id,
        gateway: gateway,
        amount: selectedCourse.final_price,
        coupon: appliedCoupon ? appliedCoupon.id : null,
      });
      setSuccess(`Successfully enrolled in "${selectedCourse.name}"!`);
      setShowPaymentModal(false);
      loadData();
    } catch (e) {
      setError(e.response?.data?.detail ?? "Payment failed. Please try again.");
      setShowPaymentModal(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  const basePrice = selectedCourse ? Number(selectedCourse.final_price) : 0;
  const couponDiscountAmount = (selectedCourse && appliedCoupon) 
    ? Number((basePrice * (Number(appliedCoupon.discount_percent) / 100)).toFixed(2)) 
    : 0;
  const discountedPrice = basePrice - couponDiscountAmount;
  const gstAmount = Number((discountedPrice * 0.18).toFixed(2));
  const totalPrice = Number((discountedPrice + gstAmount).toFixed(2));

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
                  onClick={() => handleEnrollClick(course)}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPaymentModal && selectedCourse && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="card" style={{ width: "90%", maxWidth: 450, padding: 24, background: "var(--surface)", position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <button 
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setShowPaymentModal(false)}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 16px 0", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>Course Checkout</h3>
            
            {/* Course Summary */}
            <div style={{ background: "var(--background)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>You are purchasing</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{selectedCourse.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>⏱ {selectedCourse.duration_weeks} Weeks • {selectedCourse.level}</div>
            </div>

            {/* Coupon Code Section */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Apply Promo / Coupon Code</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input 
                  type="text" 
                  placeholder="e.g. DISCOUNT10" 
                  className="form-input" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ textTransform: "uppercase" }}
                />
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={handleApplyCoupon}
                  style={{ padding: "8px 16px" }}
                >
                  Apply
                </button>
              </div>
              {couponError && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>✗ {couponError}</div>}
              {couponSuccess && <div style={{ color: "var(--success)", fontSize: 12, marginTop: 4 }}>✓ {couponSuccess}</div>}
            </div>

            {/* Gateway Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Select Payment Method</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { value: "stripe", label: "Stripe Credit Card" },
                  { value: "razorpay", label: "Razorpay (UPI / NetBanking)" }
                ].map(gw => (
                  <div 
                    key={gw.value}
                    onClick={() => setGateway(gw.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: `2px solid ${gateway === gw.value ? "#1b75ff" : "var(--border)"}`,
                      background: gateway === gw.value ? "rgba(27, 117, 255, 0.05)" : "none",
                      textAlign: "center",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {gw.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary Sheet */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Course price:</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
                  <span>Coupon discount ({appliedCoupon.discount_percent}%):</span>
                  <span>-${couponDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>GST (18%):</span>
                <span>${gstAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 4 }}>
                <span>Total amount:</span>
                <span style={{ color: "#1b75ff" }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                type="button" 
                className="btn secondary" 
                onClick={() => setShowPaymentModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={handlePayment}
                disabled={paymentLoading}
                style={{ flex: 2 }}
              >
                {paymentLoading ? "Processing..." : `Pay & Enroll ($${totalPrice.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
