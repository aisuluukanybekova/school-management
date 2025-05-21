import { useState } from 'react';
import { CssBaseline, Box, List, Divider } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Drawer } from '../../components/styles';
import StudentSideBar from './StudentSideBar';
import { useSelector } from 'react-redux';

// Student Pages
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentAttendance from './StudentAttendance';
import StudentComplain from './StudentComplain';
import StudentSettings from './StudentSettings';
import StudentSchedule from './StudentSchedule';
import StudentGrades from './StudentGrades';
import StudentSubjects from './StudentSubjects';
import StudentTutorChat from './StudentTutorChat';

// Shared
import Logout from '../Logout';

const StudentDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => setOpen(!open);
    const student = useSelector((state) => state.user.currentUser);

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
                    <StudentSideBar />
                </List>
                <Divider />
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={styles.main}>
                <Routes>
                    <Route path="/" element={<StudentHomePage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/Student/dashboard" element={<StudentHomePage />} />
                    <Route path="/Student/profile" element={<StudentProfile />} />
                    <Route path="/Student/settings" element={<StudentSettings />} />
                    <Route path="/Student/subjects" element={<StudentSubjects />} />
                    <Route path="/student/grades" element={<StudentGrades />} />
                    <Route path="/Student/attendance" element={<StudentAttendance />} />
                    <Route path="/student/schedule" element={<StudentSchedule />} />
                    <Route path="/Student/complain" element={<StudentComplain />} />
                    <Route path="/student/ai-tutor" element={<StudentTutorChat />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default StudentDashboard;

const styles = {
    main: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        padding: 3,
    },
};
