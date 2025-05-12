const mongoose = require('mongoose');
const Gradebook = require('../models/gradebookSchema');

// Получить оценки по классу, предмету и четверти
const getGradebook = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      isNaN(Number(term))
    ) {
      return res.status(400).json({ message: 'Неверные параметры запроса' });
    }

    const gradebook = await Gradebook.findOne({
      classId,
      subjectId,
      term: Number(term)
    });

    if (!gradebook) {
      // Просто возвращаем пустой объект, не создавая в базе
      return res.status(200).json({ grades: [] });
    }

    res.status(200).json(gradebook);
  } catch (error) {
    console.error('Ошибка при получении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};


// Сохранение оценок
const saveGradebook = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, grades, term } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(teacherId) ||
      !Array.isArray(grades) ||
      isNaN(Number(term))
    ) {
      return res.status(400).json({ message: 'Неверные параметры тела запроса' });
    }

    let gradebook = await Gradebook.findOne({
      classId,
      subjectId,
      term: Number(term)
    });

    if (gradebook) {
      gradebook.grades = grades;
      gradebook.teacherId = teacherId;
    } else {
      gradebook = new Gradebook({ classId, subjectId, teacherId, term: Number(term), grades });
    }

    await gradebook.save();
    res.status(200).json({ message: 'Оценки успешно сохранены', gradebook });
  } catch (error) {
    console.error('Ошибка при сохранении оценок:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить оценки ученика по всем предметам
const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('🔍 Получение оценок для ученика:', studentId);

    const all = await Gradebook.find({ 'grades.studentId': studentId })
      .populate('subjectId', 'subName')
      .populate('classId', 'sclassName');

    console.log('📚 Найдено журналов:', all.length);

    const result = [];

    all.forEach(entry => {
      const studentEntry = entry.grades.find(g => g.studentId.toString() === studentId);
      if (studentEntry) {
      result.push({
  subjectId: entry.subjectId?._id?.toString(), // 🧠 это критично!
  term: entry.term,
  values: Array.isArray(studentEntry.values) ? studentEntry.values : []
});
      }
    });

    res.status(200).json({ success: true, grades: result });
  } catch (err) {
    console.error(' Ошибка получения оценок ученика:', err.message);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};


module.exports = {
  getGradebook,
  saveGradebook,
  getGradesByStudent
};
