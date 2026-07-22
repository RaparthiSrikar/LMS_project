import { useState } from "react";
import ResourcePage from "../components/ResourcePage";
import Assignments from "./Assignments";

const TABS = [
  { key: "assignments", label: "Assignments" },
  { key: "notes", label: "Notes" },
  { key: "videos", label: "Videos" },
  { key: "live-sessions", label: "Live Sessions" },
  { key: "announcements", label: "Announcements" },
];

export default function TrainerTools() {
  const [tab, setTab] = useState("assignments");

  return (
    <div>
      <h2>Trainer Tools</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
        Create assignments, upload files, set due dates, assign marks, upload notes/videos, and publish announcements.
      </p>
      <div className="tabs">
        {TABS.map((t) => (
          <div key={t.key} className={"tab" + (tab === t.key ? " active" : "")} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === "assignments" && <Assignments />}


      {tab === "notes" && (
        <ResourcePage
          title="Notes"
          endpoint="/trainers/notes/"
          columns={[{ key: "title", label: "Title" }, { key: "course", label: "Course ID" }]}
          fields={[
            { name: "course", label: "Course ID", type: "number", required: true },
            { name: "title", label: "Title", required: true },
          ]}
        />
      )}
      {tab === "videos" && (
        <ResourcePage
          title="Videos"
          endpoint="/trainers/videos/"
          columns={[{ key: "title", label: "Title" }, { key: "course", label: "Course ID" }, { key: "duration_minutes", label: "Minutes" }]}
          fields={[
            { name: "course", label: "Course ID", type: "number", required: true },
            { name: "title", label: "Title", required: true },
            { name: "url", label: "Video URL" },
            { name: "duration_minutes", label: "Duration (min)", type: "number" },
          ]}
        />
      )}
      {tab === "live-sessions" && (
        <ResourcePage
          title="Live Sessions"
          endpoint="/trainers/live-sessions/"
          columns={[{ key: "title", label: "Title" }, { key: "course", label: "Course ID" }, { key: "scheduled_at", label: "Scheduled" }]}
          fields={[
            { name: "course", label: "Course ID", type: "number", required: true },
            { name: "title", label: "Title", required: true },
            { name: "meeting_link", label: "Meeting Link", required: true },
            { name: "scheduled_at", label: "Scheduled at", type: "datetime-local", required: true },
            { name: "duration_minutes", label: "Duration (min)", type: "number" },
          ]}
        />
      )}
      {tab === "announcements" && (
        <ResourcePage
          title="Announcements"
          endpoint="/trainers/announcements/"
          columns={[{ key: "title", label: "Title" }, { key: "course", label: "Course ID" }, { key: "published_at", label: "Published" }]}
          fields={[
            { name: "course", label: "Course ID", type: "number", required: true },
            { name: "title", label: "Title", required: true },
            { name: "message", label: "Message", type: "textarea", required: true },
          ]}
        />
      )}
    </div>
  );
}
