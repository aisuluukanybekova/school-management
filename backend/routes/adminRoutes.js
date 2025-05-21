const express = require('express');
const { adminRegister, adminLogIn, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');
const { updateAdminPassword } = require('../controllers/admin-controller.js');

const router = express.Router();

// Регистрация
router.post('/register', adminRegister);

// Логин
router.post('/login', adminLogIn);

// Получить данные
router.get('/:id', getAdminDetail);

// Обновить данные
router.put('/:id', updateAdmin);

// Смена пароля
router.put('/update-password/:id', updateAdminPassword);

module.exports = router;
