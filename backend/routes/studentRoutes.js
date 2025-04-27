const express = require('express');
const {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentsByClass, // добавил правильно
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  updateExamResult,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance
} = require('../controllers/student_controller.js');

const router = express.Router();

// Регистрация и Логин
router.post('/register', studentRegister);
router.post('/login', studentLogIn);

// Получение студентов
router.get('/school/:id', getStudents);         // Все студенты по школе
router.get('/class/:id', getStudentsByClass);    // Все студенты по классу
router.get('/:id', getStudentDetail);            // Один студент

// Удаление студентов
router.delete('/school/:id', deleteStudents);    
router.delete('/:id', deleteStudent);

// Обновление студента
router.put('/:id', updateStudent);

// Работа с посещаемостью и оценками
router.put('/attendance/:id', studentAttendance);
router.put('/examresult/:id', updateExamResult);

// Очистка посещаемости
router.put('/clear-attendance-subject/:id', clearAllStudentsAttendanceBySubject);
router.put('/clear-attendance-school/:id', clearAllStudentsAttendance);
router.put('/remove-attendance-subject/:id', removeStudentAttendanceBySubject);
router.put('/remove-attendance-student/:id', removeStudentAttendance);

module.exports = router;
