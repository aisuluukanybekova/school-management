const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

// === Регистрация преподавателя ===
const teacherRegister = async (req, res) => {
  const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const existingTeacher = await Teacher.findOne({ email });

    if (existingTeacher) {
      res.send({ message: 'Email already exists' });
    } else {
      const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });
      const result = await teacher.save();

      await Subject.findByIdAndUpdate(teachSubject, { teacher: result._id });
      result.password = undefined;
      res.send(result);
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// === Вход преподавателя (как у админа/студента) ===
const teacherLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.send({ message: "Teacher not found" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.send({ message: "Invalid password" });
    }

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName")
      .select("-password");

    res.send({
      ...populatedTeacher.toObject(),
      role: "Teacher"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  // другие методы не изменялись
};


// === Получить всех преподавателей ===
const getTeachers = async (req, res) => {
  try {
    let teachers = await Teacher.find({ school: req.params.id })
      .populate("teachSubject", "subName")
      .populate("teachSclass", "sclassName");

    if (teachers.length > 0) {
      const result = teachers.map(t => ({ ...t._doc, password: undefined }));
      res.send(result);
    } else {
      res.send({ message: "No teachers found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Получить преподавателя по ID ===
const getTeacherDetail = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName");

    if (teacher) {
      teacher.password = undefined;
      res.send(teacher);
    } else {
      res.send({ message: "No teacher found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Обновление преподавателя ===
const updateTeacher = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const result = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Обновить предмет преподавателя ===
const updateTeacherSubject = async (req, res) => {
  const { teacherId, teachSubject } = req.body;
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { teachSubject },
      { new: true }
    );

    await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

    res.send(updatedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить преподавателя ===
const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    await Subject.updateOne(
      { teacher: deletedTeacher._id, teacher: { $exists: true } },
      { $unset: { teacher: 1 } }
    );

    res.send(deletedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить всех преподавателей школы ===
const deleteTeachers = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({ school: req.params.id });

    const deletedTeachers = await Teacher.find({ school: req.params.id });

    await Subject.updateMany(
      { teacher: { $in: deletedTeachers.map(t => t._id) }, teacher: { $exists: true } },
      { $unset: { teacher: "" } }
    );

    if (deletionResult.deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
    } else {
      res.send(deletionResult);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить преподавателей по классу ===
const deleteTeachersByClass = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

    const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

    await Subject.updateMany(
      { teacher: { $in: deletedTeachers.map(t => t._id) }, teacher: { $exists: true } },
      { $unset: { teacher: "" } }
    );

    if (deletionResult.deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
    } else {
      res.send(deletionResult);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Посещаемость преподавателя ===
const teacherAttendance = async (req, res) => {
  const { status, date } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.send({ message: 'Teacher not found' });

    const existing = teacher.attendance.find((a) =>
      a.date.toDateString() === new Date(date).toDateString()
    );

    if (existing) {
      existing.status = status;
    } else {
      teacher.attendance.push({ date, status });
    }

    const result = await teacher.save();
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
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
