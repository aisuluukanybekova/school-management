const router = require('express').Router();
const { createTerm, getTerms, updateTerm } = require('../controllers/term-controller');
const Term = require('../models/termSchema');

// Получить все четверти (для админа, без фильтра)
router.get('/all', async (req, res) => {
  try {
    const terms = await Term.find();
    res.json(terms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получить четверти по schoolId (основной путь)
router.get('/school/:schoolId', getTerms);

// Альтернативный путь (ожидается в teacher-панели)
router.get('/:schoolId', getTerms);

// Получить одну четверть по ID
router.get('/term/:id', async (req, res) => {
  try {
    const term = await Term.findById(req.params.id);
    if (!term) {
      return res.status(404).json({ message: 'Четверть не найдена' });
    }
    res.json(term);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

// Создать четверть
router.post('/', createTerm);

// Обновить четверть
router.put('/:id', updateTerm);

module.exports = router;
