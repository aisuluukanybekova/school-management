const express = require('express');
const {
  complainCreate,
  complainList
} = require('../controllers/complain-controller');

const router = express.Router();

// Создать жалобу
router.post('/', complainCreate);

// Получить список жалоб по ID школы
router.get('/school/:schoolId', complainList);

module.exports = router;
