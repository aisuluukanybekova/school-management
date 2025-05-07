const mongoose = require('mongoose');
const Term = require('../models/termSchema');

// Создание четверти
exports.createTerm = async (req, res) => {
  try {
    const { school, ...rest } = req.body;

    if (!school || !mongoose.Types.ObjectId.isValid(school)) {
      return res.status(400).json({ message: 'Неверный формат schoolId' });
    }

    const term = await Term.create({
      ...rest,
      school: new mongoose.Types.ObjectId(school)
    });

    res.status(201).json(term);
  } catch (error) {
    console.error("Ошибка при создании четверти:", error.message);
    res.status(500).json({ message: "Ошибка сервера при создании четверти", error: error.message });
  }
};

// Получить все четверти школы
exports.getTerms = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Неверный формат schoolId' });
    }

    const terms = await Term.find({ school: schoolId });

    if (!terms.length) {
      return res.status(404).json({ message: 'Четверти не найдены' });
    }

    res.json(terms);
  } catch (error) {
    console.error("Ошибка при получении четвертей:", error.message);
    res.status(500).json({ message: "Ошибка сервера при получении четвертей", error: error.message });
  }
};

// Обновить четверть
exports.updateTerm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат id четверти' });
    }

    const updatedTerm = await Term.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTerm) {
      return res.status(404).json({ message: "Четверть не найдена для обновления" });
    }

    res.json(updatedTerm);
  } catch (error) {
    console.error("Ошибка при обновлении четверти:", error.message);
    res.status(500).json({ message: "Ошибка сервера при обновлении четверти", error: error.message });
  }
};
