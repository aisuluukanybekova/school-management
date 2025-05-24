const express = require('express');
const {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentsByClass,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  updateStudentPassword
} = require('../controllers/student_controller.js'); 

const router = express.Router();

// Регистрация и Логин
router.post('/register', studentRegister);
router.post('/login', studentLogIn);

// Получение студентов
router.get('/school/:id', getStudents);
router.get('/class/:id', getStudentsByClass);
router.get('/:id', getStudentDetail);

// Удаление студентов
router.delete('/school/:id', deleteStudents);
router.delete('/:id', deleteStudent);

// Обновление студента
router.put('/:id', updateStudent);

router.put('/update-password/:id', updateStudentPassword); 

module.exports = router;
