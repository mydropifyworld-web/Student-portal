import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// Student components
import Login from './components/student/Login';
import Register from './components/student/Register';
import Dashboard from './components/student/Dashboard';

// Teacher components
import TeacherRegister from './components/teacher/TeacherRegister';
import TeacherLogin from './components/teacher/TeacherLogin';
import TeacherDashboard from './components/teacher/TeacherDashboard';

// Admin
import AdminPanel from './components/admin/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';

// Service pages
import VerifyEmail from './components/servicepages/VerifyEmail';
import AdmissionForm from './components/servicepages/AdmissionForm';
import WaitingApproval from './components/servicepages/WaitingApproval';
import WaitingApproval2 from './components/servicepages/WaitingApproval-teacher';
import InteractiveSpider from './components/servicepages/InteractiveSpider';

// Sidebar pages
import Contact from './components/sidebar/Contact';
import About from './components/sidebar/About';

import './styles/App.css';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();

  // Only show spider on auth-related pages
  const showSpider = [
    "/login",
    "/register",
    "/teacher-login",
    "/teacher-register",
    "/admin-login"
  ].includes(location.pathname);

  return (
    <div className="App">
      {showSpider && <InteractiveSpider />} {/* Only render on chosen pages */}
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Student */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Teacher */}
        <Route path="/teacher-register" element={<TeacherRegister />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Service Pages */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admission-form" element={<AdmissionForm />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        <Route path="/waiting-approval-teacher" element={<WaitingApproval2 />} />

        {/* Sidebar Pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
