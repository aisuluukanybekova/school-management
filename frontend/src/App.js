import React from 'react';
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';

function App() {
  const { currentRole } = useSelector((state) => state.user);

  return (
    <Router>
      {currentRole === null
        && (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />
       <Route path="/Adminlogin" element={<LoginPage userRole="Admin" />} />
<Route path="/Studentlogin" element={<LoginPage userRole="Student" />} />
<Route path="/Teacherlogin" element={<LoginPage userRole="Teacher" />} />
          <Route path="/Adminregister" element={<AdminRegisterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        )}

      {currentRole === 'Admin' && (
        <AdminDashboard />
      )}

      {currentRole === 'Student' && (
        <StudentDashboard />
      )}

      {currentRole === 'Teacher' && (
        <TeacherDashboard />
      )}
    </Router>
  );
}

export default App;
