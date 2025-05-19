const mongoose = require('mongoose');
const Schedule = require('../models/scheduleSchema');
const Term = require('../models/termSchema');
const TimeSlot = require('../models/timeSlotSchema');
const TeacherSubjectClass = require('../models/teacherSubjectClass');

const ruToEnDay = {
  "Понедельник": "Monday",
  "Вторник": "Tuesday",
  "Среда": "Wednesday",
  "Четверг": "Thursday",
  "Пятница": "Friday",
  "Суббота": "Saturday",
  "Воскресенье": "Sunday"
};

// Расписание на день с полной валидацией
exports.createFullDaySchedule = async (req, res) => {
  try {
    const { classId, day, lessons, shift = 'first' } = req.body;

    if (!classId || !day || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ success: false, message: 'Неверные данные для создания расписания.' });
    }

    const convertedDay = ruToEnDay[day] || day;

    const timeSlots = await TimeSlot.find({ shift }).sort({ number: 1 });
    if (!timeSlots.length) {
      return res.status(400).json({ success: false, message: 'Не найдено настроек времени для смены' });
    }

    const weekSchedule = await Schedule.find({ classId, type: 'lesson' });

    const assignments = await TeacherSubjectClass.find({ sclassName: classId })
      .populate('teacher', 'name')
      .populate('subject', 'subName');

    const getMaxSessions = (subjectId, teacherId) => {
      const found = assignments.find(a =>
        a.subject?._id?.toString() === subjectId.toString() &&
        a.teacher?._id?.toString() === teacherId.toString()
      );
      return found?.sessions || 1;
    };

    const sessionTracker = {};
    const scheduleEntries = [];
    let lessonIndex = 0;

    for (const slot of timeSlots) {
      if (slot.type === 'break') {
        scheduleEntries.push({
          classId,
          day: convertedDay,
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: 'break'
        });
        continue;
      }

      if (lessonIndex >= lessons.length) break;

      const { subjectId, teacherId, startTime, endTime } = lessons[lessonIndex];

      if (!subjectId || !teacherId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: `Урок №${lessonIndex + 1}: не заполнены все поля (предмет, учитель, время)`
        });
      }

      const conflict = await Schedule.findOne({
        teacherId,
        day: convertedDay,
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Конфликт: Учитель занят с ${conflict.startTime} до ${conflict.endTime}`
        });
      }

      const key = `${subjectId}-${teacherId}`;
      sessionTracker[key] = (sessionTracker[key] || 0) + 1;

      const existingCount = weekSchedule.filter(
        s => s.subjectId.toString() === subjectId.toString() &&
             s.teacherId.toString() === teacherId.toString()
      ).length;

      const totalCount = existingCount + sessionTracker[key];
      const maxAllowed = getMaxSessions(subjectId, teacherId);

      if (totalCount > maxAllowed) {
        const assign = assignments.find(a =>
          a.subject?._id?.toString() === subjectId.toString() &&
          a.teacher?._id?.toString() === teacherId.toString()
        );

        const subjectName = assign?.subject?.subName || "предмет";
        const teacherName = assign?.teacher?.name || "учитель";

        return res.status(400).json({
          success: false,
          message: `Превышен лимит: ${teacherName} не может вести "${subjectName}" больше ${maxAllowed} раз в неделю`
        });
      }

      scheduleEntries.push({
        classId,
        subjectId,
        teacherId,
        day: convertedDay,
        startTime,
        endTime,
        type: 'lesson'
      });

      lessonIndex++;
    }

    await Schedule.insertMany(scheduleEntries);
    res.status(201).json({ success: true, message: 'Расписание на день успешно создано.' });

  } catch (error) {
    console.error('Ошибка при создании расписания:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + error.message });
  }
};

// Расписание на неделю
exports.createFullWeekSchedule = async (req, res) => {
  try {
    const { classId, weekLessons } = req.body;

    if (!classId || typeof weekLessons !== 'object' || Array.isArray(weekLessons)) {
      return res.status(400).json({ success: false, message: 'Неверные данные для расписания на неделю.' });
    }

    const assignments = await TeacherSubjectClass.find({ sclassName: classId })
      .populate('teacher', 'name')
      .populate('subject', 'subName');

    const weekSchedule = await Schedule.find({ classId, type: 'lesson' });

    const getMaxSessions = (subjectId, teacherId) => {
      const found = assignments.find(a =>
        a.subject?._id?.toString() === subjectId.toString() &&
        a.teacher?._id?.toString() === teacherId.toString()
      );
      return found?.sessions || 1;
    };

    const sessionTracker = {};
    const bulkOps = [];

    for (const [day, lessons] of Object.entries(weekLessons)) {
      const convertedDay = ruToEnDay[day] || day;

      for (const lesson of lessons) {
        const { subjectId, teacherId, startTime, endTime } = lesson;

        if (!subjectId || !teacherId || !startTime || !endTime) {
          return res.status(400).json({ success: false, message: `Некорректные данные в дне ${day}` });
        }

        const conflict = await Schedule.findOne({
          teacherId,
          day: convertedDay,
          $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
        });

        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Конфликт: Учитель занят ${convertedDay} с ${conflict.startTime} до ${conflict.endTime}`
          });
        }

        const key = `${subjectId}-${teacherId}`;
        sessionTracker[key] = (sessionTracker[key] || 0) + 1;

        const existingCount = weekSchedule.filter(
          s => s.subjectId.toString() === subjectId.toString() &&
               s.teacherId.toString() === teacherId.toString()
        ).length;

        const totalCount = existingCount + sessionTracker[key];
        const maxAllowed = getMaxSessions(subjectId, teacherId);

        if (totalCount > maxAllowed) {
          const assign = assignments.find(a =>
            a.subject?._id?.toString() === subjectId.toString() &&
            a.teacher?._id?.toString() === teacherId.toString()
          );

          const subjectName = assign?.subject?.subName || "предмет";
          const teacherName = assign?.teacher?.name || "учитель";

          return res.status(400).json({
            success: false,
            message: `Превышен лимит: ${teacherName} не может вести "${subjectName}" больше ${maxAllowed} раз в неделю`
          });
        }

        bulkOps.push({
          insertOne: {
            document: {
              classId,
              subjectId,
              teacherId,
              day: convertedDay,
              startTime,
              endTime,
              type: 'lesson'
            }
          }
        });
      }
    }

    if (!bulkOps.length) {
      return res.status(400).json({ success: false, message: 'Нет корректных уроков для сохранения.' });
    }

    await Schedule.bulkWrite(bulkOps);
    res.status(201).json({ success: true, message: 'Расписание на неделю успешно создано.' });

  } catch (error) {
    console.error('Ошибка при создании расписания на неделю:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + error.message });
  }
};

//  Получить расписание по ID класса
exports.getScheduleByClass = async (req, res) => {
  try {
    const schedules = await Schedule.find({ classId: req.params.classId })
      .populate({ path: 'subjectId', select: 'subName', strictPopulate: false })
      .populate({ path: 'teacherId', select: 'name', strictPopulate: false });

    res.json({ success: true, schedules });
  } catch (error) {
    console.error(' Ошибка получения расписания по классу:', error.message);
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + error.message });
  }
};

//  Удалить элемент расписания
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: ' Элемент расписания удалён.' });
  } catch (error) {
    console.error(' Ошибка удаления расписания:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + error.message });
  }
};
// Обновить элемент расписания

exports.updateSchedule = async (req, res) => {
  try {
    const { subjectId, teacherId, startTime, endTime, day, classId } = req.body;
    const { id } = req.params;

    if (!subjectId || !teacherId || !startTime || !endTime || !day || !classId) {
      return res.status(400).json({ message: 'Не все поля указаны для обновления.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный ID элемента расписания.' });
    }

    const currentLesson = await Schedule.findById(id);
    if (!currentLesson) {
      return res.status(404).json({ message: 'Текущий урок не найден.' });
    }

    // Проверка конфликта по времени
    const conflict = await Schedule.findOne({
      _id: { $ne: id },
      teacherId,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        message: `Конфликт: Учитель уже занят с ${conflict.startTime} до ${conflict.endTime}`
      });
    }

    const assignments = await TeacherSubjectClass.find({ sclassName: classId });
    const found = assignments.find(a =>
      a.subject?.toString?.() === subjectId.toString() &&
      a.teacher?.toString?.() === teacherId.toString()
    );

    const maxSessions = found?.sessions || 1;

    const allLessons = await Schedule.find({
      teacherId,
      subjectId,
      classId,
      type: 'lesson'
    });

    // Посчитать количество занятий, исключая текущий, но только если его параметры изменились
    let effectiveLessons = allLessons.filter(lesson => lesson._id.toString() !== id);

    // Если текущее занятие меняет subjectId или teacherId, его надо исключить из подсчета
    const isChangingAssignment = (
      currentLesson.subjectId.toString() !== subjectId.toString() ||
      currentLesson.teacherId.toString() !== teacherId.toString()
    );

    if (!isChangingAssignment) {
      effectiveLessons.push(currentLesson); // оставить в подсчёте, если связка та же
    }

    if (effectiveLessons.length >= maxSessions) {
      return res.status(400).json({
        message: `Лимит: Этот учитель уже ведёт данный предмет ${maxSessions} раз в неделю`
      });
    }

    const updated = await Schedule.findByIdAndUpdate(
      id,
      { subjectId, teacherId, startTime, endTime, day },
      { new: true }
    );

    return res.json({ success: true, updated });

  } catch (err) {
    console.error('Ошибка при обновлении расписания:', err.message);
    return res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};


// Получить расписание по учителю + классу + предмету
exports.getScheduleByTeacherClassSubject = async (req, res) => {
  try {
    const { teacherId, classId, subjectId } = req.params;

    const lessons = await Schedule.find({
      teacherId,
      classId,
      subjectId,
      type: 'lesson'
    }).sort({ day: 1, startTime: 1 });

    //res.status(200).json({ success: true, lessons });
    res.status(200).json({ schedules: lessons });

  } catch (error) {
    console.error('Ошибка получения расписания:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Получить расписание по ID учителя
exports.getScheduleByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const lessons = await Schedule.find({
      teacherId,
      type: 'lesson'
    })
      .populate('subjectId', 'subName')
      .populate('classId', 'sclassName')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ schedules: lessons });
  } catch (error) {
    console.error('Ошибка при получении расписания учителя:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить даты уроков по расписанию на заданную четверть
exports.getLessonDatesInTerm = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;

    if (!classId || !subjectId || !term) {
      return res.status(400).json({ message: 'Нужны classId, subjectId и term' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(subjectId)
    ) {
      return res.status(400).json({ message: 'Неверный classId или subjectId' });
    }

    const termDoc = await Term.findOne({ termNumber: Number(term) });
    if (!termDoc) {
      return res.status(404).json({ message: 'Четверть не найдена' });
    }

    // ВАЖНО: преобразуем в ObjectId
    const lessons = await Schedule.find({
      classId: new mongoose.Types.ObjectId(classId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      type: 'lesson'
    });

    const dayMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };

    const start = new Date(termDoc.startDate);
    const end = new Date(termDoc.endDate);
    const allDates = [];

    lessons.forEach(schedule => {
      const targetDay = dayMap[schedule.day];
      if (targetDay === undefined) return;

      let current = new Date(start);
      while (current <= end) {
        if (current.getDay() === targetDay) {
          allDates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    });

    allDates.sort((a, b) => a - b);
    res.json(allDates.map(date => date.toISOString()));
  } catch (err) {
    console.error('Ошибка получения дат уроков по четверти:', err.message);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

