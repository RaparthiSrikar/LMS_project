import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import TrainerTools from "./pages/TrainerTools";
import Enrollments from "./pages/Enrollments";
import Payments from "./pages/Payments";
import Assignments from "./pages/Assignments";
import Quizzes from "./pages/Quizzes";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Student pages
import MyJourney from "./pages/MyJourney";
import OtherCourses from "./pages/OtherCourses";
import Bookmarks from "./pages/Bookmarks";
import Discussions from "./pages/Discussions";
import PlacementPrep from "./pages/PlacementPrep";
import QuestionBank from "./pages/QuestionBank";
import Notebook from "./pages/Notebook";
import Playground from "./pages/Playground";
import CodeSnippets from "./pages/CodeSnippets";
import Taskflow from "./pages/Taskflow";
import InviteEarn from "./pages/InviteEarn";

// Trainer Dashboard pages
import CourseBuilder from "./pages/CourseBuilder";
import NotesManager from "./pages/NotesManager";
import VideosManager from "./pages/VideosManager";
import LiveSessions from "./pages/LiveSessions";
import StudentsManager from "./pages/StudentsManager";
import Analytics from "./pages/Analytics";
import Announcements from "./pages/Announcements";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const withLayout = (el) => <ProtectedRoute><Layout>{el}</Layout></ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={withLayout(<Dashboard />)} />
      <Route path="/users" element={withLayout(<Users />)} />
      <Route path="/courses" element={withLayout(<Courses />)} />
      <Route path="/trainer-tools" element={withLayout(<TrainerTools />)} />
      <Route path="/enrollments" element={withLayout(<Enrollments />)} />
      <Route path="/payments" element={withLayout(<Payments />)} />
      <Route path="/assignments" element={withLayout(<Assignments />)} />
      <Route path="/quizzes" element={withLayout(<Quizzes />)} />
      <Route path="/reports" element={withLayout(<Reports />)} />

      {/* Student sub-pages routes */}
      <Route path="/my-journey" element={withLayout(<MyJourney />)} />
      <Route path="/other-courses" element={withLayout(<OtherCourses />)} />
      <Route path="/bookmarks" element={withLayout(<Bookmarks />)} />
      <Route path="/discussions" element={withLayout(<Discussions />)} />
      <Route path="/placement-prep" element={withLayout(<PlacementPrep />)} />
      <Route path="/question-bank" element={withLayout(<QuestionBank />)} />
      <Route path="/notebook" element={withLayout(<Notebook />)} />
      <Route path="/playground" element={withLayout(<Playground />)} />
      <Route path="/code-snippets" element={withLayout(<CodeSnippets />)} />
      <Route path="/taskflow" element={withLayout(<Taskflow />)} />
      <Route path="/invite-earn" element={withLayout(<InviteEarn />)} />

      {/* Trainer Console sub-pages routes */}
      <Route path="/course-builder" element={withLayout(<CourseBuilder />)} />
      <Route path="/notes" element={withLayout(<NotesManager />)} />
      <Route path="/videos" element={withLayout(<VideosManager />)} />
      <Route path="/live-sessions" element={withLayout(<LiveSessions />)} />
      <Route path="/students" element={withLayout(<StudentsManager />)} />
      <Route path="/analytics" element={withLayout(<Analytics />)} />
      <Route path="/announcements" element={withLayout(<Announcements />)} />
      <Route path="/messages" element={withLayout(<Messages />)} />
      <Route path="/profile" element={withLayout(<Profile />)} />
      <Route path="/settings" element={withLayout(<Settings />)} />
    </Routes>
  );
}
