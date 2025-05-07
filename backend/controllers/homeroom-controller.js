const AttendanceJournal = require('../models/attendanceJournalSchema');
const Gradebook = require('../models/gradebookSchema');
const Student = require('../models/studentSchema');
require('../models/subjectSchema'); 

const getHomeroomSummary = async (req, res) => {
  const { classId } = req.params;
  const { term, subjectId } = req.query;

  try {
    if (!term) {
      return res.status(400).json({ message: 'Не указана четверть (term)' });
    }

    console.log(' Запрос: ', { classId, term, subjectId });

    // === Получение студентов ===
    const students = await Student.find({ sclassName: classId }).lean();
    if (!students || students.length === 0) {
      console.log(' Нет учеников в классе');
      return res.status(200).json({ students: [] });
    }
    console.log(' Студентов найдено:', students.length);

    // === Пропуски ===
    const attendanceFilter = { classId, term };
    if (subjectId) attendanceFilter.subjectId = subjectId;

    const attendanceDocs = await AttendanceJournal.find(attendanceFilter).lean();
    console.log('📘 Пропусков найдено:', attendanceDocs?.length || 0);

    const attendanceMap = {};
    (attendanceDocs || []).forEach(doc => {
      (doc.records || []).forEach(({ studentId, date }) => {
        if (!attendanceMap[studentId]) attendanceMap[studentId] = [];
        attendanceMap[studentId].push(date);
      });
    });

    // === Оценки ===
    const gradeFilter = { classId, term };
    if (subjectId) gradeFilter.subjectId = subjectId;

    const gradeDocs = await Gradebook.find(gradeFilter)
      .populate({
        path: 'subjectId',
        select: 'subName',
        strictPopulate: false,
      })
      .lean();

    console.log('📘 Оценочных документов найдено:', gradeDocs?.length || 0);

    const gradeMap = {};
    (gradeDocs || []).forEach(doc => {
      if (!doc.subjectId || !doc.subjectId.subName) {
        console.warn(' Пропущен gradeDoc — отсутствует subjectId');
        return;
      }

      const subName = doc.subjectId.subName;

      if (!Array.isArray(doc.grades)) return;

      doc.grades.forEach(({ studentId, values }) => {
        const validGrades = Array.isArray(values)
          ? values.filter(v => typeof v.grade === 'number')
          : [];

        const avg = validGrades.length
          ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length
          : 0;

        if (!gradeMap[studentId]) gradeMap[studentId] = [];
        gradeMap[studentId].push({
          subject: subName,
          avg: Number(avg.toFixed(2))
        });
      });
    });

    // === Формирование ответа ===
    const result = students.map(student => ({
      _id: student._id,
      name: student.name,
      phone: student.rollNum || '-',
      absentCount: attendanceMap[student._id]?.length || 0,
      grades: gradeMap[student._id] || []
    }));

    res.status(200).json({ students: result });
  } catch (err) {
    console.error('Ошибка при получении данных Классного Руководителя:');
    console.error('classId:', classId);
    console.error('term:', term);
    console.error('subjectId:', subjectId);
    console.error('Сообщение:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

module.exports = { getHomeroomSummary };
