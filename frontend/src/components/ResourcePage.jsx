import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * Generic list + create + delete panel for a REST resource.
 * columns: [{ key, label, render? }]
 * fields:  [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea', options? }]
 */
export default function ResourcePage({ title, endpoint, columns, fields, extraAction }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get(endpoint);
      setRows(data.results ?? data);
    } catch (e) {
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [endpoint]);

  const handleChange = (name, value) => setFormData((f) => ({ ...f, [name]: value }));

  const handleToggleForm = () => {
    if (showForm) {
      setFormData({});
      setEditId(null);
      setShowForm(false);
    } else {
      setFormData({});
      setEditId(null);
      setShowForm(true);
    }
  };

  const handleEditClick = (row) => {
    setFormData(row);
    setEditId(row.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let payload = formData;
      const hasFile = Object.values(formData).some((v) => v instanceof File);
      if (hasFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== "") {
            fd.append(k, v);
          }
        });
        payload = fd;
      }

      if (editId) {
        await client.put(`${endpoint}${editId}/`, payload);
      } else {
        await client.post(endpoint, payload);
      }
      setFormData({});
      setEditId(null);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    await client.delete(`${endpoint}${id}/`);
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h2>{title}</h2>
        {user?.role !== "student" && (
          <button className="btn" onClick={handleToggleForm}>
            {showForm ? "Cancel" : "+ New"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-text">{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {fields.map((f) => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      className="form-input"
                      value={formData[f.name] ?? ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                    >
                      <option value="">Select…</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="form-input"
                      rows={3}
                      value={formData[f.name] ?? ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                    />
                  ) : f.type === "file" ? (
                    <input
                      type="file"
                      className="form-input"
                      onChange={(e) => handleChange(f.name, e.target.files[0])}
                    />
                  ) : (
                    <input
                      className="form-input"
                      type={f.type || "text"}
                      value={formData[f.name] ?? ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <button className="btn" type="submit" style={{ marginTop: 8 }}>
              {editId ? "Update" : "Save"}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ color: "var(--text-muted)" }}>No records yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                  <td style={{ textAlign: "right" }}>
                    {extraAction && extraAction(row, load)}
                    {user?.role !== "student" && (
                      <>
                        <button className="btn secondary" style={{ marginRight: 8 }} onClick={() => handleEditClick(row)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
