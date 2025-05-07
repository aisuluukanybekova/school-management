const express = require('express');
const {
  noticeCreate,
  noticeList,
  deleteNotice,
  deleteNotices,
  updateNotice
} = require('../controllers/notice-controller');

const router = express.Router();

// Создать объявление
router.post('/', noticeCreate);

// Получить все объявления по школе
router.get('/school/:schoolId', noticeList);

// Обновить объявление
router.put('/:id', updateNotice);

// Удалить одно объявление
router.delete('/:id', deleteNotice);

// Удалить все объявления школы
router.delete('/school/:schoolId', deleteNotices);

module.exports = router;
