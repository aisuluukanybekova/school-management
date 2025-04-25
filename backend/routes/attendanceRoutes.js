const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance } = require('../controllers/attendance-controller');

// Получить посещаемость
router.get('/attendance', getAttendance);

// Сохранить посещаемость
router.post('/attendance', saveAttendance);

module.exports = router;
