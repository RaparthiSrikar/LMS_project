import ResourcePage from "../components/ResourcePage";
import client from "../api/client";

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "student", label: "Student" },
  { value: "hr", label: "HR" },
];

export default function Users() {
  return (
    <ResourcePage
      title="User Management"
      endpoint="/auth/users/"
      columns={[
        { key: "email", label: "Email" },
        { key: "username", label: "Username" },
        { key: "role", label: "Role" },
        {
          key: "is_active_account", label: "Status",
          render: (r) => <span className={"badge " + (r.is_active_account ? "success" : "danger")}>{r.is_active_account ? "Active" : "Inactive"}</span>,
        },
      ]}
      fields={[
        { name: "username", label: "Username", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "first_name", label: "First name" },
        { name: "last_name", label: "Last name" },
        { name: "role", label: "Role", type: "select", options: ROLE_OPTIONS, required: true },
      ]}
      extraAction={(row, reload) => (
        <button
          className="btn secondary"
          style={{ marginRight: 8 }}
          onClick={async () => {
            await client.post(`/auth/users/${row.id}/${row.is_active_account ? "deactivate" : "activate"}/`);
            reload();
          }}
        >
          {row.is_active_account ? "Deactivate" : "Activate"}
        </button>
      )}
    />
  );
}
