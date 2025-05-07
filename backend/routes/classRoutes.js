const express = require('express');
const router = express.Router();
const Sclass = require('../models/sclassSchema');

const {
  sclassCreate,
  sclassList,
  getHomeroomClass,
  getSclassDetail,
  getSclassStudents,
  updateSclass,
  deleteSclass,
  deleteSclasses
} = require('../controllers/class-controller');

//  Создать класс
router.post('/', sclassCreate);

//  Получить все классы школы (по school ID)
router.get('/school/:id', sclassList);

//  Получить ВСЕ классы без фильтрации
router.get('/', async (req, res) => {
  try {
    const classes = await Sclass.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Получить класс по ID классного руководителя
router.get('/homeroom/:teacherId', getHomeroomClass);

//  Получить детали конкретного класса
router.get('/:id', getSclassDetail);

//  Получить всех учеников класса
router.get('/:id/students', getSclassStudents);

//  Обновить класс (имя или homeroomTeacherId)
router.put('/:id', updateSclass);

//  Удалить конкретный класс
router.delete('/:id', deleteSclass);

//  Удалить все классы школы
router.delete('/school/:id', deleteSclasses);

module.exports = router;
