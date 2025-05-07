const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

// Создать новый класс (с возможностью указать классного руководителя)
const sclassCreate = async (req, res) => {
  try {
    const { sclassName, adminID, homeroomTeacherId } = req.body;

    if (!sclassName || !adminID) {
      return res.status(400).json({ message: "Имя класса и ID школы обязательны" });
    }

    const existingSclass = await Sclass.findOne({ sclassName, school: adminID });
    if (existingSclass) {
      return res.status(400).json({ message: 'Такой класс уже существует' });
    }

    const sclass = new Sclass({
      sclassName,
      school: adminID,
      homeroomTeacherId: homeroomTeacherId || null
    });

    const result = await sclass.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Ошибка при создании класса:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить список всех классов школы
const sclassList = async (req, res) => {
  try {
    const sclasses = await Sclass.find({ school: req.params.id })
      .populate('homeroomTeacherId', 'name');

    if (sclasses.length === 0) {
      return res.status(404).json({ message: "Классы не найдены" });
    }

    res.json(sclasses);
  } catch (error) {
    console.error('Ошибка при получении списка классов:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить класс, где teacherId — классный руководитель
const getHomeroomClass = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const klass = await Sclass.findOne({ homeroomTeacherId: teacherId })
      .populate('school', 'schoolName');

    if (!klass) {
      return res.status(404).json({ message: "Класс не найден" });
    }

    res.json(klass);
  } catch (error) {
    console.error('Ошибка при получении класса КР:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить детали одного класса
const getSclassDetail = async (req, res) => {
  try {
    const sclass = await Sclass.findById(req.params.id)
      .populate("school", "schoolName")
      .populate("homeroomTeacherId", "name");

    if (!sclass) {
      return res.status(404).json({ message: "Класс не найден" });
    }

    res.json(sclass);
  } catch (error) {
    console.error('Ошибка при получении класса:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить всех учеников класса
const getSclassStudents = async (req, res) => {
  try {
    const students = await Student.find({ sclassName: req.params.id });

    if (students.length === 0) {
      return res.status(404).json({ message: "Ученики не найдены" });
    }

    const modifiedStudents = students.map(student => {
      const { password, ...rest } = student._doc;
      return rest;
    });

    res.json(modifiedStudents);
  } catch (error) {
    console.error('Ошибка при получении учеников класса:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Удалить один класс
const deleteSclass = async (req, res) => {
  try {
    const deletedClass = await Sclass.findByIdAndDelete(req.params.id);

    if (!deletedClass) {
      return res.status(404).json({ message: "Класс не найден" });
    }

    await Promise.all([
      Student.deleteMany({ sclassName: req.params.id }),
      Subject.deleteMany({ sclassName: req.params.id }),
      Teacher.deleteMany({ teachSclass: req.params.id }),
    ]);

    res.json(deletedClass);
  } catch (error) {
    console.error('Ошибка при удалении класса:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Удалить все классы школы
const deleteSclasses = async (req, res) => {
  try {
    const deletedClasses = await Sclass.deleteMany({ school: req.params.id });

    if (deletedClasses.deletedCount === 0) {
      return res.status(404).json({ message: "Нет классов для удаления" });
    }

    await Promise.all([
      Student.deleteMany({ school: req.params.id }),
      Subject.deleteMany({ school: req.params.id }),
      Teacher.deleteMany({ school: req.params.id }),
    ]);

    res.json(deletedClasses);
  } catch (error) {
    console.error('Ошибка при удалении всех классов:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновить имя класса + классного руководителя
const updateSclass = async (req, res) => {
  try {
    const { sclassName, homeroomTeacherId } = req.body;

    const updated = await Sclass.findByIdAndUpdate(
      req.params.id,
      {
        sclassName,
        homeroomTeacherId: homeroomTeacherId || null
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Класс не найден для обновления" });
    }

    res.json(updated);
  } catch (error) {
    console.error('Ошибка при обновлении класса:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

module.exports = {
  sclassCreate,
  sclassList,
  getHomeroomClass,
  getSclassDetail,
  getSclassStudents,
  deleteSclass,
  deleteSclasses,
  updateSclass,
};
