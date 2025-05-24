import { useState } from 'react';
import {
  CssBaseline, Box, List, Divider,
} from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Drawer } from '../../components/styles';
import SideBar from './SideBar';

// Страницы
import Logout from '../Logout';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';
import AdminSettings from './AdminSettings';
import GradebookJournal from './Journal/GradebookJournal';
import AttendanceJournal from './Journal/AttendanceJournal';
import GradebookReport from './Journal/GradebookReport';
import AttendanceReportPage from './Journal/AttendanceReportPage';
import TermTabs from './TermTabs';
import ScheduleTable from './teacherSchedule/ScheduleTable';
import AddSchedulePage from './teacherSchedule/AddSchedulePage';

// Students
import AddStudent from './studentRelated/AddStudent';
import ShowStudents from './studentRelated/ShowStudents';
import SeeComplains from './studentRelated/SeeComplains';
import StudentProfile from './studentRelated/StudentProfile';

// Subjects
import ShowSubjects from './subjectRelated/ShowSubjects';
import AddSubject from './subjectRelated/AddSubject';
import ViewSubject from './subjectRelated/ViewSubject';
import AssignSubject from './subjectRelated/AssignSubject';

// Teachers
import AddTeacher from './teacherRelated/AddTeacher';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import EditSchedulePage from './teacherSchedule/EditSchedulePage';

// Classes
import AddClass from './classRelated/AddClass';
import ShowClasses from './classRelated/ShowClasses';
import ClassDetails from './classRelated/ClassDetails';
import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

function AdminDashboard() {
  const [open] = useState(true);

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
          <SideBar />
        </List>
        <Divider />
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={styles.main}>
        <Routes>
          {/* Главные маршруты */}
          <Route path="/" element={<AdminHomePage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/Admin/dashboard" element={<AdminHomePage />} />
          <Route path="/Admin/profile" element={<AdminProfile />} />
          <Route path="/Admin/settings" element={<AdminSettings />} />

          {/* Журналы */}
          <Route path="/admin/journal" element={<GradebookJournal />} />
          <Route path="/admin/attendance" element={<AttendanceJournal />} />
          <Route path="/Admin/report" element={<GradebookReport />} />
          <Route path="/Admin/attendance-report" element={<AttendanceReportPage />} />

          {/* Четверти */}
          <Route path="/Admin/terms" element={<TermTabs />} />

          {/* Расписание */}
          <Route path="/Admin/teacher-schedule" element={<ScheduleTable />} />
          <Route path="/Admin/add-schedule" element={<AddSchedulePage />} />
          <Route path="/Admin/edit-schedule" element={<EditSchedulePage />} />

          {/* Ученики */}
          <Route
            path="/Admin/addstudents"
            element={<AddStudent situation="Student" />}
          />
          <Route path="/Admin/students" element={<ShowStudents />} />
          <Route path="/Admin/complains" element={<SeeComplains />} />
          <Route
            path="/Admin/students/student/:id"
            element={<StudentProfile />}
          />

          {/* Учителя */}
          <Route path="/Admin/teachers" element={<ShowTeachers />} />
          <Route
            path="/Admin/teachers/teacher/:id"
            element={<TeacherDetails />}
          />
          <Route
            path="/Admin/teachers/addteacher"
            element={<AddTeacher />}
          />
          <Route
            path="/Admin/teachers/chooseclass"
            element={<ChooseClass situation="Teacher" />}
          />
          <Route
            path="/Admin/teachers/choosesubject/:id"
            element={<ChooseSubject situation="Norm" />}
          />
          <Route
            path="/Admin/teachers/choosesubject/:classID/:teacherID"
            element={<ChooseSubject situation="Teacher" />}
          />

          {/* Предметы */}
          <Route path="/Admin/subjects" element={<ShowSubjects />} />
          <Route
            path="/Admin/subjects/chooseclass"
            element={<ChooseClass situation="Subject" />}
          />
          <Route path="/Admin/addsubject" element={<AddSubject />} />
          <Route
            path="/Admin/subjects/subject/:subjectID"
            element={<ViewSubject />}
          />
          <Route path="/Admin/subjects/assign" element={<AssignSubject />} />

          {/* Классы */}
          <Route path="/Admin/addclass" element={<AddClass />} />
          <Route path="/Admin/classes" element={<ShowClasses />} />
          <Route
            path="/Admin/classes/class/:id"
            element={<ClassDetails />}
          />
          <Route
            path="/Admin/class/addstudents/:id"
            element={<AddStudent situation="Class" />}
          />

          {/* Объявления */}
          <Route path="/Admin/addnotice" element={<AddNotice />} />
          <Route path="/Admin/notices" element={<ShowNotices />} />

          {/* Выход */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default AdminDashboard;

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
