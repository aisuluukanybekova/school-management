const router = require('express').Router();
const {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacher,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance
} = require('../controllers/teacher-controller');

// === Преподаватель Роуты ===

// Регистрация
router.post('/register', teacherRegister);

// Вход
router.post('/login', teacherLogIn);

// Получить всех преподавателей по школе
router.get('/school/:id', getTeachers);

// Получить одного преподавателя по id
router.get('/:id', getTeacherDetail);

// Обновить преподавателя
router.put('/:id', updateTeacher);

// Обновить предмет преподавателя
router.put('/update-subject', updateTeacherSubject);

// Удалить одного преподавателя
router.delete('/:id', deleteTeacher);

// Удалить всех преподавателей школы
router.delete('/school/:id', deleteTeachers);

// Удалить всех преподавателей класса
router.delete('/class/:id', deleteTeachersByClass);

// Отметить посещаемость преподавателя
router.post('/attendance/:id', teacherAttendance);

module.exports = router;
