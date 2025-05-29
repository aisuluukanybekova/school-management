import { useState } from 'react';
import {
  CssBaseline, Box, List, Divider,
} from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Drawer } from '../../components/styles';
import TeacherSideBar from './TeacherSideBar';

// Страницы
import Logout from '../Logout';
import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherSettings from './TeacherSettings';
import TeacherGradebook from './TeacherGradebook';
import TeacherAttendanceJournal from './TeacherAttendanceJournal';
import HomeroomDashboard from './HomeroomDashboard';
import HomeroomDashboardExtended from './HomeroomDashboardExtended';
import TeacherSchedule from './TeacherSchedule';
import TeacherLessonTopics from './TeacherLessonTopics';

function TeacherDashboard() {
  const [open] = useState(true); // 🔧 removed unused setOpen
  const teacher = useSelector((state) => state.user.currentUser);
  const isHomeroomTeacher = Boolean(teacher?.homeroomFor);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{ width: open ? 240 : 64 }}
      >
        <List component="nav">
          <TeacherSideBar />
        </List>
        <Divider />
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={styles.main}>
        <Routes>
          <Route path="/" element={<TeacherHomePage />} />
          <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
          <Route path="/Teacher/profile" element={<TeacherProfile />} />
          <Route path="/Teacher/settings" element={<TeacherSettings />} />
          <Route path="/Teacher/complain" element={<TeacherComplain />} />
          <Route path="/Teacher/class" element={<TeacherClassDetails />} />
          <Route path="/Teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/Teacher/topics" element={<TeacherLessonTopics />} />
          <Route path="/Teacher/gradebook" element={<TeacherGradebook />} />
          <Route path="/Teacher/attendance" element={<TeacherAttendanceJournal />} />
          {isHomeroomTeacher && (
            <>
              <Route path="/Teacher/homeroom" element={<HomeroomDashboard />} />
              <Route path="/Teacher/homeroom-extended" element={<HomeroomDashboardExtended />} />
            </>
          )}
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;

const styles = {
  main: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    backgroundColor: (theme) => (theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[900]),
    padding: 3,
  },
};
