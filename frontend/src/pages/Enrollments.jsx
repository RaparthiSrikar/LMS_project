import ResourcePage from "../components/ResourcePage";

export default function Enrollments() {
  return (
    <ResourcePage
      title="My Learning"
      endpoint="/students/enrollments/"
      columns={[
        { key: "course_name", label: "Course" },
        { key: "progress_percent", label: "Progress %" },
        {
          key: "is_completed", label: "Status",
          render: (r) => <span className={"badge " + (r.is_completed ? "success" : "")}>{r.is_completed ? "Completed" : "In progress"}</span>,
        },
      ]}
      fields={[{ name: "course", label: "Course ID", type: "number", required: true }]}
    />
  );
}
