const mongoose = require('mongoose');
const Term = require('../models/termSchema');

// ➕ Создание четверти
exports.createTerm = async (req, res) => {
  try {
    const termData = {
      ...req.body,
      school: mongoose.Types.ObjectId(req.body.school), // Приводим school к ObjectId
    };

    const term = await Term.create(termData);
    res.json(term);
  } catch (err) {
    console.error("\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0438:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Получить все четверти
exports.getTerms = async (req, res) => {
  try {
    const terms = await Term.find({ school: req.params.schoolId });
    res.json(terms);
  } catch (err) {
    console.error("\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0435\u0439:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Обновить четверть
exports.updateTerm = async (req, res) => {
  try {
    const term = await Term.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(term);
  } catch (err) {
    console.error("\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 обновлении четверти:", err.message);
    res.status(500).json({ message: err.message });
  }
};
