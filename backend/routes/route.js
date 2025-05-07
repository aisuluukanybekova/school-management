const express = require('express');
const router = express.Router();

// Контроллеры
const { adminRegister, adminLogIn, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

// ========== Админ ==========
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogIn);
router.get('/admin/:id', getAdminDetail);
router.put('/admin/:id', updateAdmin);

module.exports = router;
