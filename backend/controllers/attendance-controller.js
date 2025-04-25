const AttendanceJournal = require('../models/attendanceJournalSchema');

// Получить посещаемость по классу, предмету, четверти
const getAttendance = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    const journal = await AttendanceJournal.findOne({ classId, subjectId, term })
      .populate('classId')
      .populate('subjectId')
      .populate('records.statuses.studentId', 'firstName lastName');

    if (!journal) {
      return res.status(404).json({ message: 'Журнал посещаемости не найден' });
    }

    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении посещаемости', error });
  }
};

// Сохранить / обновить посещаемость
const saveAttendance = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, term, records } = req.body;

    let journal = await AttendanceJournal.findOne({ classId, subjectId, term });

    if (journal) {
      journal.records = records;
    } else {
      journal = new AttendanceJournal({ classId, subjectId, teacherId, term, records });
    }

    await journal.save();

    res.status(200).json({ message: 'Посещаемость сохранена', journal });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при сохранении посещаемости', error });
  }
};

module.exports = {
  getAttendance,
  saveAttendance,
};
