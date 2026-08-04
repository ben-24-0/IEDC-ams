import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";

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

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    setLoggedIn(false);
  };

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