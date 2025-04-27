const express = require('express');
const {
    sclassCreate,
    sclassList,
    deleteSclass,
    deleteSclasses,
    getSclassDetail,
    getSclassStudents,
    updateSclass
} = require('../controllers/class-controller');

const router = express.Router();

// ✅ Создать класс
router.post('/', sclassCreate);

// ✅ Получить все классы школы
router.get('/school/:id', sclassList);

// ✅ Получить детали конкретного класса
router.get('/:id', getSclassDetail);

// ✅ Получить всех учеников класса
router.get('/:id/students', getSclassStudents);

// ✅ Обновить класс
router.put('/:id', updateSclass);

// ✅ Удалить конкретный класс
router.delete('/:id', deleteSclass);

// ✅ Удалить все классы школы
router.delete('/school/:id', deleteSclasses);

module.exports = router;
