const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

// === Регистрация студента ===
const studentRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const existingStudent = await Student.findOne({
      rollNum: req.body.rollNum,
      school: req.body.adminID,
      sclassName: req.body.sclassName,
    });

    if (existingStudent) {
      res.send({ message: 'Roll Number already exists' });
    } else {
      const student = new Student({
        ...req.body,
        school: req.body.adminID,
        password: hashedPass,
      });

      const result = await student.save();
      result.password = undefined;
      res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Вход студента ===
const studentLogIn = async (req, res) => {
  try {
    let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
    if (student) {
      const validated = await bcrypt.compare(req.body.password, student.password);
      if (validated) {
        student = await student.populate("school", "schoolName");
        student = await student.populate("sclassName", "sclassName");
        student.password = undefined;
        student.examResult = undefined;
        student.attendance = undefined;
        res.send(student);
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Получить всех студентов школы ===
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
    if (students.length > 0) {
      const modified = students.map((s) => ({ ...s._doc, password: undefined }));
      res.send(modified);
    } else {
      res.send({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Получить студентов по классу ===
const getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.find({ sclassName: req.params.id }).populate("sclassName", "sclassName");
    if (students.length > 0) {
      const modified = students.map((s) => ({ ...s._doc, password: undefined }));
      res.send(modified);
    } else {
      res.send({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Получить одного студента ===
const getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("school", "schoolName")
      .populate("sclassName", "sclassName")
      .populate("examResult.subName", "subName")
      .populate("attendance.subName", "subName sessions");

    if (student) {
      student.password = undefined;
      res.send(student);
    } else {
      res.send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// === Удалить одного студента ===
const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить всех студентов школы ===
const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ school: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить студентов по классу ===
const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Обновить студента ===
const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const result = await Student.findByIdAndUpdate(
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

// === Обновить оценку ===
const updateExamResult = async (req, res) => {
  const { subName, marksObtained, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.send({ message: 'Student not found' });

    const existingResult = student.examResult.find((r) => r.subName.toString() === subName);

    if (existingResult) {
      existingResult.marksObtained = marksObtained;
      existingResult.date = date;
    } else {
      student.examResult.push({ subName, marksObtained, date });
    }

    const result = await student.save();
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Посещаемость студента ===
const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.send({ message: 'Student not found' });

    const subject = await Subject.findById(subName);

    const existing = student.attendance.find((a) =>
      a.date.toDateString() === new Date(date).toDateString() &&
      a.subName.toString() === subName
    );

    if (existing) {
      existing.status = status;
    } else {
      const attended = student.attendance.filter((a) => a.subName.toString() === subName).length;
      if (attended >= subject.sessions) return res.send({ message: 'Maximum attendance limit reached' });

      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Очистить посещаемость по предмету ===
const clearAllStudentsAttendanceBySubject = async (req, res) => {
  try {
    const result = await Student.updateMany(
      { 'attendance.subName': req.params.id },
      { $pull: { attendance: { subName: req.params.id } } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Очистить всю посещаемость по школе ===
const clearAllStudentsAttendance = async (req, res) => {
  try {
    const result = await Student.updateMany(
      { school: req.params.id },
      { $set: { attendance: [] } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Удалить посещаемость по предмету для 1 ученика ===
const removeStudentAttendanceBySubject = async (req, res) => {
  try {
    const result = await Student.updateOne(
      { _id: req.params.id },
      { $pull: { attendance: { subName: req.body.subId } } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// === Очистить всю посещаемость для 1 ученика ===
const removeStudentAttendance = async (req, res) => {
  try {
    const result = await Student.updateOne(
      { _id: req.params.id },
      { $set: { attendance: [] } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentsByClass,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};
