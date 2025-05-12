const Complain = require('../models/complainSchema');

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
    const data = await Complain.find({ school: schoolId }).populate('user', 'name role');
    res.json(data);
  } catch (error) {
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
