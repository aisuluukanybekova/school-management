const Complain = require('../models/complainSchema');
const mongoose = require('mongoose');
const Student = require('../models/studentSchema.js');

exports.complainCreate = async (req, res) => {
  try {
    const { user, school, date, complaint } = req.body;

    if (!user || !school || !complaint || !date) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    const newComplain = new Complain({ user, school, date, complaint });
    const saved = await newComplain.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Ошибка создания жалобы:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.complainList = async (req, res) => {
  try {
    const { schoolId } = req.params;

    console.log(" schoolId получен:", schoolId);

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Некорректный ID школы' });
    }

    const data = await Complain.find({ school: schoolId }).populate('user', 'name role');
    console.log(" найдено жалоб:", data.length);
    res.json(data);
  } catch (error) {
    console.error("Ошибка при получении жалоб:", error.message);
    res.status(500).json({ message: 'Ошибка получения жалоб' });
  }
};



exports.complainDelete = async (req, res) => {
  try {
    await Complain.findByIdAndDelete(req.params.id);
    res.json({ message: 'Жалоба удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления жалобы' });
  }
};
