const Gradebook = require('../models/gradebookSchema');

// Получить оценки по классу, предмету и четверти
const getGradebook = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    const gradebook = await Gradebook.findOne({ classId, subjectId, term })
      .populate('classId')
      .populate('subjectId')
      .populate('grades.studentId', 'firstName lastName');

    if (!gradebook) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }

    res.status(200).json(gradebook);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении журнала', error });
  }
};

// Сохранить или обновить журнал
const saveGradebook = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, term, grades } = req.body;

    let gradebook = await Gradebook.findOne({ classId, subjectId, term });

    if (gradebook) {
      gradebook.grades = grades;
    } else {
      gradebook = new Gradebook({ classId, subjectId, teacherId, term, grades });
    }

    await gradebook.save();

    res.status(200).json({ message: 'Оценки успешно сохранены', gradebook });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при сохранении оценок', error });
  }
};

module.exports = {
  getGradebook,
  saveGradebook,
};
