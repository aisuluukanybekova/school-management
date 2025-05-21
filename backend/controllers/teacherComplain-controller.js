const mongoose = require('mongoose');
const TeacherComplain = require('../models/teacherComplainSchema');

exports.createTeacherComplain = async (req, res) => {
  try {
    const { teacher, school, complaintType, description, date } = req.body;

    if (!teacher || !school || !complaintType || !description) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    const newComplain = new TeacherComplain({ teacher, school, complaintType, description, date });
    const saved = await newComplain.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Ошибка создания жалобы от учителя:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getTeacherComplainsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    console.log(" schoolId получен:", schoolId);

    const complaints = await TeacherComplain.find({ school: schoolId }).populate('teacher', 'name');
    console.log(" найдено жалоб:", complaints.length);

    res.json(complaints);
  } catch (error) {
    console.error("Ошибка при получении жалоб учителей:", error.message);
    res.status(500).json({ message: 'Ошибка получения жалоб учителей' });
  }
};

exports.deleteTeacherComplain = async (req, res) => {
  try {
    await TeacherComplain.findByIdAndDelete(req.params.id);
    res.json({ message: 'Жалоба учителя удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления жалобы учителя' });
  }
};
