import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashBoard";

function AdminSection() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminToken"));

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLoggedIn(false);
  };

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}

function StudentSection() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("studentToken"));
  const isStudentAdmin =
    !!localStorage.getItem("adminToken") &&
    localStorage.getItem("userRole") === "admin";

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("studentTeam");
    localStorage.removeItem("userRole");
    setLoggedIn(false);
  };

  if (isStudentAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (!loggedIn) return <StudentLogin onLogin={() => setLoggedIn(true)} />;
  return <StudentDashboard onLogout={handleLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentSection />} />
        <Route path="/admin" element={<AdminSection />} />
      </Routes>
    </BrowserRouter>
  );
}