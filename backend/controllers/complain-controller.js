const Complain = require('../models/complainSchema.js');

// Создание жалобы
const complainCreate = async (req, res) => {
  try {
    const { user, school, complaint } = req.body;

if (!user || !school || !complaint) {
  return res.status(400).json({ message: 'Необходимо заполнить все поля: user, school, complaint' });
}
const complain = new Complain({ user, school, complaint });

    const result = await complain.save();

    res.status(201).json(result);
  } catch (error) {
    console.error('Ошибка при создании жалобы:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить все жалобы по школе
const complainList = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;

    const complains = await Complain.find({ school: schoolId })
      .populate("user", "name role");

    if (complains.length === 0) {
      return res.status(404).json({ message: "Жалобы не найдены" });
    }

    res.status(200).json(complains);
  } catch (error) {
    console.error('Ошибка при получении жалоб:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

module.exports = {
  complainCreate,
  complainList
};
