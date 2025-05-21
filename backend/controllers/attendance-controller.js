const mongoose = require('mongoose');
const AttendanceJournal = require('../models/attendanceJournalSchema');
const Schedule = require('../models/scheduleSchema');
const Term = require('../models/termSchema');
const Student = require('../models/studentSchema');
require('../models/subjectSchema');

// Получить посещаемость по классу, предмету и четверти
const getAttendance = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    if (!classId || !subjectId || !term) {
      return res.status(400).json({ message: 'classId, subjectId и term обязательны' });
    }

    const journal = await AttendanceJournal.findOne({ classId, subjectId, term });

    res.status(200).json({
      classId,
      subjectId,
      term,
      records: journal?.records || []
    });
  } catch (error) {
    console.error('Ошибка получения посещаемости:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Сохранить посещаемость — только отсутствующих
const saveAttendance = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, term, records } = req.body;

    if (!classId || !subjectId || !teacherId || !term || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Отсутствуют обязательные поля или records не массив' });
    }

    const absentOnly = records.flatMap(entry =>
      (entry?.values || []).filter(v => v.status === 'Отсутствовал')
        .map(v => ({ studentId: entry.studentId, date: v.date, status: 'Отсутствовал' }))
    );

    let journal = await AttendanceJournal.findOne({ classId, subjectId, term });

    if (journal) {
      journal.records = absentOnly;
    } else {
      journal = new AttendanceJournal({
        classId,
        subjectId,
        teacherId,
        term,
        records: absentOnly
      });
    }

    await journal.save();
    res.status(200).json({ message: 'Посещаемость обновлена' });
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить посещаемость конкретного ученика
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const journals = await AttendanceJournal.find({ "records.studentId": studentId })
      .populate('subjectId', 'subName');

    const result = journals.flatMap(journal => {
      return journal.records
        .filter(r => r.studentId.toString() === studentId)
        .map(r => ({
          subjectName: journal.subjectId?.subName || 'Неизвестный предмет',
          date: r.date,
          status: r.status,
          term: journal.term 
        }));
    });

    res.status(200).json({ records: result });
  } catch (error) {
    console.error('Ошибка при получении посещаемости ученика:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Отчёт по посещаемости
const getAttendanceReport = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    if (!classId || !subjectId || !term) {
      return res.status(400).json({ message: 'classId, subjectId и term обязательны' });
    }

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Неверный classId или subjectId' });
    }

    const termDoc = await Term.findOne({ termNumber: Number(term) });
    if (!termDoc) return res.status(404).json({ message: 'Четверть не найдена' });

    const start = new Date(termDoc.startDate);
    const end = new Date(termDoc.endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    const schedule = await Schedule.find({ classId, subjectId, type: 'lesson' });
    const weekdays = [...new Set(schedule.map(s => s.day))];

    const dayMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };

    //  Генерация всех дат уроков по расписанию
    const lessonDates = [];
    weekdays.forEach(day => {
      const target = dayMap[day];
      if (target === undefined) return;

      let current = new Date(start);
      while (current <= end) {
        if (current.getUTCDay() === target) {
          lessonDates.push(new Date(current));
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
    });

    const totalLessons = lessonDates.length;

    const journal = await AttendanceJournal.findOne({ classId, subjectId, term });
    const absences = journal?.records || [];

    const allStudents = await Student.find().populate('sclassName');
    const students = allStudents.filter(s =>
      s.sclassName?._id?.toString() === classId.toString()
    );

    const report = students.map(student => {
      const missed = absences.filter(r =>
        r.studentId.toString() === student._id.toString()
      ).length;

      const present = totalLessons - missed;

      return {
        studentName: `${student.surname || ''} ${student.name || ''}`.trim(),
        totalLessons,
        present,
        absent: missed,
        percent: totalLessons > 0 ? +(present / totalLessons * 100).toFixed(1) : 0
      };
    });

    res.json(report);
  } catch (err) {
    console.error('Ошибка отчета посещаемости:', err.message);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

// Отладочный отчёт
const getAttendanceDebug = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    if (!classId || !subjectId || !term) {
      return res.status(400).json({ message: 'classId, subjectId и term обязательны' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(subjectId)
    ) {
      return res.status(400).json({ message: 'Неверный classId или subjectId' });
    }

    const termDoc = await Term.findOne({ termNumber: Number(term) });
    if (!termDoc) return res.status(404).json({ message: 'Четверть не найдена' });

    const start = new Date(termDoc.startDate);
    const end = new Date(termDoc.endDate);
    const schedule = await Schedule.find({ classId, subjectId, type: 'lesson' });

    const dayMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };

    const weekdays = [...new Set(schedule.map(s => s.day))];
    const lessonDates = [];

    weekdays.forEach(day => {
      const target = dayMap[day];
      if (target === undefined) return;

      let current = new Date(start);
      while (current <= end) {
        if (current.getDay() === target) {
          lessonDates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    });

    const students = await Student.find({ classId });
    const journal = await AttendanceJournal.findOne({ classId, subjectId, term });

    res.json({
      termRange: { start: start.toISOString(), end: end.toISOString() },
      scheduleDays: weekdays,
      lessonCount: lessonDates.length,
      lessonDates: lessonDates.map(d => d.toISOString()),
      studentCount: students.length,
      absences: journal?.records || []
    });
  } catch (err) {
    console.error('DEBUG: Ошибка отчета:', err.message);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

module.exports = {
  getAttendance,
  saveAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceDebug
};
 