const express = require('express');
const {
  createSubject,
  getSubjectsBySchool,
  getSubjectsByClass,
  getSubjectDetail,
  updateSubject,
  deleteSubject,
  deleteSubjects,
  deleteSubjectsByClass
} = require('../controllers/subject-controller.js');

const router = express.Router();

// === Сначала более специфичные маршруты ===

// Получить все предметы по школе
router.get('/school/:id', getSubjectsBySchool);

// Получить все предметы по классу
router.get('/class/:id', getSubjectsByClass);

// Удалить все предметы по школе
router.delete('/school/:id', deleteSubjects);

// Удалить все предметы по классу
router.delete('/class/:id', deleteSubjectsByClass);

// === Потом общие маршруты ===

// Получить детали одного предмета
router.get('/:id', getSubjectDetail);

// Добавить новый предмет
router.post('/', createSubject);

// Обновить предмет
router.put('/:id', updateSubject);

// Удалить один предмет
router.delete('/:id', deleteSubject);

module.exports = router;
