import client from "../api/client";

const REPORTS = [
  ["Student Report", "/reports/students/"],
  ["Attendance Report", "/reports/attendance/"],
  ["Assignment Report", "/reports/assignments/"],
  ["Quiz Report", "/reports/quizzes/"],
  ["Trainer Performance", "/reports/trainer-performance/"],
];

async function download(path, format) {
  const res = await client.get(path, { params: { format }, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `report.${format === "excel" ? "xlsx" : "pdf"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function Reports() {
  return (
    <div>
      <h2>Reports</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>Generate and download PDF or Excel reports.</p>
      <div className="card">
        <table>
          <thead><tr><th>Report</th><th></th></tr></thead>
          <tbody>
            {REPORTS.map(([label, path]) => (
              <tr key={path}>
                <td>{label}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn secondary" style={{ marginRight: 8 }} onClick={() => download(path, "pdf")}>Download PDF</button>
                  <button className="btn" onClick={() => download(path, "excel")}>Download Excel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
