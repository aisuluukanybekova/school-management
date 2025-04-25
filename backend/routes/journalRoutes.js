const express = require('express');
const router = express.Router();
const { getGradebook, saveGradebook } = require('../controllers/journal-controller');

// Получить оценки по параметрам (classId, subjectId, term)
router.get('/grades', getGradebook);

// Сохранить/обновить журнал
router.post('/grades', saveGradebook);

module.exports = router;
