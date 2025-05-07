const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema');
const Subject = require('../models/subjectSchema');
const Sclass = require('../models/sclassSchema'); //  корректно импортирован

// Регистрация преподавателя
const teacherRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    school,
    teachSubject,
    teachSclass,
    homeroomFor
  } = req.body;

  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).send({ message: 'Email уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const teacher = new Teacher({
      name,
      email,
      password: hashedPass,
      role,
      school,
      ...(teachSubject && { teachSubject }),
      ...(teachSclass && { teachSclass }),
      ...(homeroomFor && { homeroomFor })
    });

    const result = await teacher.save();

    if (teachSubject) {
      await Subject.findByIdAndUpdate(teachSubject, { teacher: result._id });
    }

    if (homeroomFor) {
      const sclass = await Sclass.findById(homeroomFor); //  теперь правильно
      if (!sclass) {
        return res.status(400).json({ message: 'Класс не найден для homeroomFor' });
      }
      sclass.homeroomTeacherId = result._id;
      await sclass.save();
    }

    const userData = {
      _id: result._id,
      name: result.name,
      email: result.email,
      role: result.role,
      school: result.school,
      teachSubject: result.teachSubject || null,
      teachSclass: result.teachSclass || null,
      homeroomFor: result.homeroomFor || null
    };

    res.send(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// Остальные методы (login, get, update, delete) без изменений

const teacherLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).send({ message: "Преподаватель не найден" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).send({ message: "Неверный пароль" });

    const populated = await Teacher.findById(teacher._id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName")
      .populate("homeroomFor", "sclassName")
      .select("-password");

    res.send(populated);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ school: req.params.id })
      .populate("teachSubject", "subName")
      .populate("teachSclass", "sclassName")
      .populate("homeroomFor", "sclassName");

    res.send(teachers);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getTeacherDetail = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName")
      .populate("homeroomFor", "sclassName");

    if (!teacher) return res.status(404).send({ message: "Преподаватель не найден" });

    res.send(teacher);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateTeacher = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updated = await Teacher.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.send(updated);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateTeacherSubject = async (req, res) => {
  const { teacherId, teachSubject } = req.body;
  try {
    const updated = await Teacher.findByIdAndUpdate(teacherId, { teachSubject }, { new: true });
    await Subject.findByIdAndUpdate(teachSubject, { teacher: updated._id });
    res.send(updated);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    await Subject.updateMany({ teacher: deleted._id }, { $unset: { teacher: "" } });
    res.send({ message: "Преподаватель удален" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteTeachers = async (req, res) => {
  try {
    const deleted = await Teacher.find({ school: req.params.id });
    await Teacher.deleteMany({ school: req.params.id });
    await Subject.updateMany({ teacher: { $in: deleted.map(t => t._id) } }, { $unset: { teacher: "" } });
    res.send({ message: "Все преподаватели удалены" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteTeachersByClass = async (req, res) => {
  try {
    const deleted = await Teacher.find({ teachSclass: req.params.id });
    await Teacher.deleteMany({ teachSclass: req.params.id });
    await Subject.updateMany({ teacher: { $in: deleted.map(t => t._id) } }, { $unset: { teacher: "" } });
    res.send({ message: "Преподаватели по классу удалены" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const teacherAttendance = async (req, res) => {
  const { status, date } = req.body;
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).send({ message: "Не найден" });

    const existing = teacher.attendance.find((a) => a.date.toDateString() === new Date(date).toDateString());
    if (existing) existing.status = status;
    else teacher.attendance.push({ date, status });

    const saved = await teacher.save();
    res.send(saved);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacher,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance
};
