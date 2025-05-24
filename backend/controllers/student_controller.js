const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');

// Регистрация студента
const studentRegister = async (req, res) => {
  try {
    const { rollNum, password, sclassName, adminID } = req.body;
    const existingStudent = await Student.findOne({ rollNum, school: adminID, sclassName });

    if (existingStudent) {
      return res.status(400).send({ message: 'Номер ученика уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const student = new Student({ ...req.body, password: hashedPass, school: adminID });

    const result = await student.save();

    const safeResult = {
      _id: result._id,
      name: result.name,
      rollNum: result.rollNum,
      sclassName: result.sclassName,
      school: result.school,
    };

    res.send(safeResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
  }
};

// Логин студента
const studentLogIn = async (req, res) => {
  try {
    const { rollNum, studentName, password } = req.body;
    let student = await Student.findOne({ rollNum, name: studentName });

    if (!student) {
      return res.status(404).send({ message: 'Ученик не найден' });
    }

    const validated = await bcrypt.compare(password, student.password);

    if (!validated) {
      return res.status(400).send({ message: 'Неверный пароль' });
    }

    const populatedStudent = await Student.findById(student._id)
      .populate("school", "schoolName")
      .populate("sclassName", "sclassName")
      .select("-password");

    res.send(populatedStudent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка входа', error: err.message });
  }
};

// Получить всех студентов школы
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
    const cleanStudents = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNum: s.rollNum,
      sclassName: s.sclassName,
      school: s.school
    }));
    res.send(cleanStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения студентов' });
  }
};

// Получить студентов по классу
const getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.find({ sclassName: req.params.id }).populate("sclassName", "sclassName");
    const cleanStudents = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNum: s.rollNum,
      sclassName: s.sclassName,
      school: s.school
    }));
    res.send(cleanStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения студентов класса' });
  }
};

// Получить одного студента
const getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("school", "schoolName")
      .populate("sclassName", "sclassName")
      .select("-password");

    if (student) {
      res.send(student);
    } else {
      res.status(404).send({ message: 'Ученик не найден' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения ученика', error: err.message });
  }
};

// Удалить одного ученика
const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.send({ message: 'Ученик удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления ученика' });
  }
};

// Удалить всех учеников школы
const deleteStudents = async (req, res) => {
  try {
    await Student.deleteMany({ school: req.params.id });
    res.send({ message: 'Все ученики удалены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления всех учеников' });
  }
};

// Удалить учеников по классу
const deleteStudentsByClass = async (req, res) => {
  try {
    await Student.deleteMany({ sclassName: req.params.id });
    res.send({ message: 'Ученики класса удалены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления учеников по классу' });
  }
};

// Обновить ученика
const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    updated.password = undefined;
    res.send(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка обновления ученика' });
  }
};
const updateStudentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Ученик не найден' });

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Старый пароль неверный' });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    await student.save();

    res.json({ message: 'Пароль успешно обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при смене пароля', error: err.message });
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
  deleteStudentsByClass,
  updateStudentPassword
};
