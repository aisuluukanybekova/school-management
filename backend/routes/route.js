// backend/routes/route.js

const express = require('express');
const router = express.Router();

// Контроллеры
const { adminRegister, adminLogIn, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const { saveSchedule, getSchedule } = require('../controllers/schedule-controller.js');

// ========== Админ ==========
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogIn);
router.get('/admin/:id', getAdminDetail);
router.put('/admin/:id', updateAdmin);

// ========== Жалобы ==========
router.post('/complain', complainCreate);
router.get('/complain/:id', complainList);

// ========== Уведомления ==========
router.post('/notice', noticeCreate);
router.get('/notice/:id', noticeList);
router.delete('/notice/:id', deleteNotice);
router.delete('/notices/:id', deleteNotices);
router.put('/notice/:id', updateNotice);

// ========== Расписание ==========
router.post('/schedule', saveSchedule);
router.get('/schedule/:teacherId', getSchedule);

// ========== Фиксированные базовые маршруты ==========
// Сюда НЕ включены: students, teachers, classes, subjects -> они подключаются в index.js отдельно через /api/... маршруты

module.exports = router;
