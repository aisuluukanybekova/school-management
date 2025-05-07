const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');
const LessonTopic = require('../models/lessonTopicSchema');

// Создание новых предметов
const createSubject = async (req, res) => {
  try {
    const { subName, sessions, adminID, sclassName, teacher } = req.body;

    if (!subName || !adminID) {
      return res.status(400).json({ message: "subName и adminID обязательны" });
    }

    const newSubject = new Subject({
      subName,
      sessions: sessions || null,
      school: adminID,
      sclassName: sclassName || null,
      teacher: teacher || null
    });

    const saved = await newSubject.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Ошибка при создании предмета:", error);
    res.status(500).json({ message: "Ошибка при создании", error: error.message });
  }
};


// Получение всех предметов школы
const getSubjectsBySchool = async (req, res) => {
  try {
    const subjects = await Subject.find({ school: req.params.id }).populate("sclassName", "sclassName");
    if (!subjects.length) {
      return res.status(404).send({ message: "Предметы не найдены" });
    }
    res.send(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения предметов", error: error.message });
  }
};

// Получение всех предметов класса
const getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ sclassName: req.params.id })
    .populate("teacher", "name"); // подтягивает имя учителя  
    if (!subjects.length) {
      return res.status(404).send({ message: "Предметы не найдены" });
    }
    res.send(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения предметов класса", error: error.message });
  }
};

// Получение подробностей предмета
const getSubjectDetail = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("sclassName", "sclassName")
      .populate("teacher", "name");

    if (!subject) {
      return res.status(404).send({ message: "Предмет не найден" });
    }

    res.send(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения предмета", error: error.message });
  }
};

// Обновление предмета
const updateSubject = async (req, res) => {
  try {
    const { subName, sessions } = req.body;
    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { subName, sessions },
      { new: true }
    );
    if (!updated) {
      return res.status(404).send({ message: "Предмет не найден для обновления" });
    }
    res.send(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления предмета", error: error.message });
  }
};

// Удаление одного предмета
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).send({ message: "Предмет не найден для удаления" });
    }

    await Teacher.updateOne(
      { teachSubject: subject._id },
      { $unset: { teachSubject: "" } }
    );

    await Student.updateMany(
      {},
      { $pull: { examResult: { subName: subject._id }, attendance: { subName: subject._id } } }
    );

    res.send(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления предмета", error: error.message });
  }
};

// Удаление всех предметов по школе
const deleteSubjects = async (req, res) => {
  try {
    const subjectsToDelete = await Subject.find({ school: req.params.id });

    if (!subjectsToDelete.length) {
      return res.status(404).send({ message: "Нет предметов для удаления" });
    }

    const subjectIds = subjectsToDelete.map(sub => sub._id);

    await Subject.deleteMany({ school: req.params.id });

    await Teacher.updateMany(
      { teachSubject: { $in: subjectIds } },
      { $unset: { teachSubject: "" } }
    );

    await Student.updateMany({}, { $set: { examResult: [], attendance: [] } });

    res.send({ message: "Все предметы школы удалены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления предметов школы", error: error.message });
  }
};

// Удаление всех предметов по классу
const deleteSubjectsByClass = async (req, res) => {
  try {
    const subjectsToDelete = await Subject.find({ sclassName: req.params.id });

    if (!subjectsToDelete.length) {
      return res.status(404).send({ message: "Нет предметов для удаления" });
    }

    const subjectIds = subjectsToDelete.map(sub => sub._id);

    await Subject.deleteMany({ sclassName: req.params.id });

    await Teacher.updateMany(
      { teachSubject: { $in: subjectIds } },
      { $unset: { teachSubject: "" } }
    );

    await Student.updateMany({}, { $set: { examResult: [], attendance: [] } });

    res.send({ message: "Все предметы класса удалены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления предметов класса", error: error.message });
  }
};

// Получение свободных предметов (без учителя)
const freeSubjectList = async (req, res) => {
  try {
    const subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
    if (!subjects.length) {
      return res.status(404).send({ message: "Нет свободных предметов" });
    }
    res.send(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения свободных предметов", error: error.message });
  }
};

const getSubjectWithTopics = async (req, res) => {
  console.log(' Ищем предмет с ID:', req.params.id); 
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("sclassName", "sclassName")
      .populate("teacher", "name");

    if (!subject) {
      console.log(' Предмет не найден в БД');
      return res.status(404).send({ message: "Предмет не найден" });
    }

    const topics = await LessonTopic.find({ subjectId: subject._id })
      .select("topic homework day startTime term")
      .sort({ day: 1, startTime: 1 });

    res.send({ subject, topics });
  } catch (error) {
    console.error("Ошибка в getSubjectWithTopics:", error.message);
    res.status(500).json({ message: "Ошибка получения предмета и тем", error: error.message });
  }
};


module.exports = {
  createSubject,
  getSubjectsBySchool,
  getSubjectsByClass,
  getSubjectDetail,
  updateSubject,
  deleteSubject,
  deleteSubjects,
  deleteSubjectsByClass,
  freeSubjectList,
  getSubjectWithTopics
};
