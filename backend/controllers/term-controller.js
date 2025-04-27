const mongoose = require('mongoose');
const Term = require('../models/termSchema');

// Создание четверти
exports.createTerm = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.school)) {
      return res.status(400).json({ message: 'Неверный формат schoolId' });
    }

    const termData = {
      ...req.body,
      school: new mongoose.Types.ObjectId(req.body.school), // обязательно через new
    };

    const term = await Term.create(termData);
    res.json(term);
  } catch (err) {
    console.error("Ошибка при создании четверти:", err.message);
    res.status(500).json({ message: err.message });
  }
};

//  Получить все четверти
exports.getTerms = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.schoolId)) {
      return res.status(400).json({ message: 'Неверный формат schoolId' });
    }

    const terms = await Term.find({ school: new mongoose.Types.ObjectId(req.params.schoolId) });
    res.json(terms);
  } catch (err) {
    console.error(" Ошибка при получении четвертей:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Обновить четверть
exports.updateTerm = async (req, res) => {
  try {
    const term = await Term.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(term);
  } catch (err) {
    console.error(" Ошибка при обновлении четверти:", err.message);
    res.status(500).json({ message: err.message });
  }
};
