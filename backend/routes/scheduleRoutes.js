const express = require('express');
const router = express.Router();

const {
  createFullDaySchedule,
  createFullWeekSchedule,
  getScheduleByClass,
  getScheduleByTeacherClassSubject,
  getScheduleByTeacher,
  deleteSchedule,
  updateSchedule,
  getLessonDatesInTerm
} = require('../controllers/schedule-controller');

//  Создать расписание на один день
router.post('/full-day', createFullDaySchedule);

// Создать расписание на неделю
router.post('/full-week', createFullWeekSchedule);

// Получить расписание по классу
router.get('/class/:classId', getScheduleByClass);

// Получить расписание по учителю + классу + предмету
router.get('/by-teacher-class-subject/:teacherId/:classId/:subjectId', getScheduleByTeacherClassSubject);

// Получить все уроки учителя
router.get('/by-teacher/:teacherId', getScheduleByTeacher);

// Получить даты уроков по четверти
router.get('/lesson-dates', getLessonDatesInTerm);

// Удалить элемент расписания
router.delete('/:id', deleteSchedule);

// Обновить элемент расписания
router.put('/:id', updateSchedule);

module.exports = router;
