const express = require('express');
const router = express.Router();

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
  teacherAttendance,
  updateTeacherPassword
} = require('../controllers/teacher-controller');

// === Роуты для преподавателей ===
router.post('/register', teacherRegister);
router.post('/login', teacherLogIn);
router.get('/school/:id', getTeachers); 
router.get('/:id', getTeacherDetail);
router.put('/:id', updateTeacher);
router.put('/update-subject', updateTeacherSubject);
router.delete('/:id', deleteTeacher);
router.delete('/school/:id', deleteTeachers);
router.delete('/class/:id', deleteTeachersByClass);
router.post('/attendance/:id', teacherAttendance);
router.put('/update-password/:id', updateTeacherPassword);

//  Дополнительный — получить всех преподавателей без фильтра
router.get('/', async (req, res) => {
  try {
    const Teacher = require('../models/teacherSchema');
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//  Получить всех классных руководителей школы
router.get('/homerooms/:schoolId', async (req, res) => {
  try {
    const Teacher = require('../models/teacherSchema');
    const homerooms = await Teacher.find({ school: req.params.schoolId, homeroomFor: { $ne: null } })
      .populate('homeroomFor', 'sclassName');
    res.status(200).json(homerooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
