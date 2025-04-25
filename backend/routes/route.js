const router = require('express').Router();

// ========== Controllers ==========
const {
  adminRegister, adminLogIn, getAdminDetail, updateAdmin
} = require('../controllers/admin-controller.js');

const {
  sclassCreate, sclassList, deleteSclass, deleteSclasses,
  getSclassDetail, getSclassStudents, updateSclass
} = require('../controllers/class-controller.js');

const { complainCreate, complainList } = require('../controllers/complain-controller.js');

const {
  noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice
} = require('../controllers/notice-controller.js');

const {
  subjectCreate, classSubjects, deleteSubjectsByClass,
  getSubjectDetail, deleteSubject, freeSubjectList,
  allSubjects, deleteSubjects, updateSubject
} = require('../controllers/subject-controller.js');

const {
  studentRegister, studentLogIn, getStudents, getStudentDetail,
  deleteStudents, deleteStudent, updateStudent, studentAttendance,
  deleteStudentsByClass, updateExamResult, clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance, removeStudentAttendanceBySubject, removeStudentAttendance
} = require('../controllers/student_controller.js');

const {
  teacherRegister, teacherLogIn, getTeachers, getTeacherDetail,
  deleteTeachers, deleteTeachersByClass, deleteTeacher,
  updateTeacher, updateTeacherSubject, teacherAttendance
} = require('../controllers/teacher-controller.js');

const {
  saveSchedule, getSchedule
} = require('../controllers/schedule-controller.js'); // ✅ Schedule controller
const Sclass = require('../models/sclassSchema');
const Subject = require('../models/subjectSchema');
// ========== Admin ==========
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", getAdminDetail);
router.put("/Admin/:id", updateAdmin);

// ========== Student ==========
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn);
router.get("/Students/:id", getStudents);
router.get("/Student/:id", getStudentDetail);
router.delete("/Students/:id", deleteStudents);
router.delete("/StudentsClass/:id", deleteStudentsByClass);
router.delete("/Student/:id", deleteStudent);
router.put("/Student/:id", updateStudent);
router.put('/UpdateExamResult/:id', updateExamResult);
router.put('/StudentAttendance/:id', studentAttendance);
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance);

// ========== Teacher ==========
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get("/Teachers/:id", getTeachers);
router.get("/Teacher/:id", getTeacherDetail);
router.delete("/Teachers/:id", deleteTeachers);
router.delete("/TeachersClass/:id", deleteTeachersByClass);
router.delete("/Teacher/:id", deleteTeacher);
router.put("/Teacher/:id", updateTeacher);
router.put("/TeacherSubject", updateTeacherSubject);
router.post('/TeacherAttendance/:id', teacherAttendance);

// ========== Notice ==========
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices);
router.delete("/Notice/:id", deleteNotice);
router.put("/Notice/:id", updateNotice);

// ========== Complain ==========
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// ========== Sclass ==========
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail);
router.get("/Sclass/Students/:id", getSclassStudents);
router.delete("/Sclasses/:id", deleteSclasses);
router.delete("/Sclass/:id", deleteSclass);
router.put("/Sclass/:id", updateSclass);
router.get('/classes', async (req, res) => {
  try {
    const classes = await Sclass.find(); // без фильтров
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/students/class/:id', getSclassStudents); 
// ========== Subject ==========
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail);
router.delete("/Subject/:id", deleteSubject);
router.delete("/Subjects/:id", deleteSubjects);
router.delete("/SubjectsClass/:id", deleteSubjectsByClass);
router.put("/Subject/:id", updateSubject);
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== Schedule (Teacher) ==========
router.post('/schedule', saveSchedule);
router.get('/schedule/:teacherId', getSchedule); // ✅ Добавлен маршрут

module.exports = router;
