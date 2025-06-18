const TeacherSubjectClass = require('../models/teacherSubjectClass');
require('../models/subjectSchema'); 

//  Назначить предмет учителю и классу
exports.createTeacherSubjectClass = async (req, res) => {
  try {
    const { teacherID, subjectId, sclassName, sessions } = req.body;

    if (!teacherID || !subjectId || !sclassName || !sessions) {
      return res.status(400).json({ message: "Все поля обязательны для заполнения" });
    }

    const exists = await TeacherSubjectClass.findOne({ teacher: teacherID, subject: subjectId, sclassName });

    if (exists) {
      return res.status(409).json({ message: "Такая запись уже существует" });
    }

    //  ДОБАВЛЯЕМ school:
    const adminId = req.admin?._id || req.body.school;
    if (!adminId) return res.status(400).json({ message: 'ID школы не передан' });

    const record = await TeacherSubjectClass.create({
      teacher: teacherID,
      subject: subjectId,
      sclassName,
      sessions,
      school: adminId 
    });

    res.status(201).json({ message: "Предмет успешно назначен", record });
  } catch (error) {
    console.error("Ошибка при создании связи:", error);
    res.status(500).json({ message: "Ошибка создания связи", error: error.message });
  }
};


//  Получить все назначения
exports.getAllTeacherSubjectClasses = async (req, res) => {
  try {
    const records = await TeacherSubjectClass.find()
      .populate('teacher', 'name')
      .populate('subject', 'subName')
      .populate('sclassName', 'sclassName');

    res.status(200).json(records);
  } catch (error) {
    console.error("Ошибка при получении связей:", error);
    res.status(500).json({ message: "Ошибка получения связей", error: error.message });
  }
};

// Получить список предметов по классу (уникальные)
exports.getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const records = await TeacherSubjectClass.find({ sclassName: classId })
      .populate('subject', 'subName');

    const uniqueSubjects = {};
    records.forEach(rec => {
      const id = rec.subject?._id?.toString();
      if (id && !uniqueSubjects[id]) {
        uniqueSubjects[id] = {
          subjectId: rec.subject._id,
          subjectName: rec.subject.subName
        };
      }
    });

    res.status(200).json(Object.values(uniqueSubjects));
  } catch (error) {
    console.error('Ошибка получения предметов по классу:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

//  Получить предметы и учителей по классу
exports.getSubjectsWithTeachersByClass = async (req, res) => {
  try {
    const classId = req.params.classId;

    const records = await TeacherSubjectClass.find({ sclassName: classId })
      .populate('subject', 'subName')
      .populate('teacher', 'name email');

    const grouped = records.reduce((acc, rec) => {
      const subjId = rec.subject?._id?.toString();
      if (!subjId) return acc;

      if (!acc[subjId]) {
        acc[subjId] = {
          subjectId: subjId,
          subjectName: rec.subject.subName,
          teachers: []
        };
      }

      acc[subjId].teachers.push({
        _id: rec.teacher._id,
        name: rec.teacher.name,
        email: rec.teacher.email || "—"
      });

      return acc;
    }, {});

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error('Ошибка получения предметов и учителей:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

//  Группировка по преподавателю
exports.getTeachersWithSubjects = async (req, res) => {
  try {
    const records = await TeacherSubjectClass.find()
      .populate('teacher')
      .populate('subject')
      .populate('sclassName');

    const grouped = records.reduce((acc, rec) => {
      const t = rec.teacher;
      if (!t) return acc;

      if (!acc[t._id]) {
        acc[t._id] = {
          _id: t._id,
          name: t.name,
          email: t.email,
          role: t.role,
          school: t.school,
          assignments: []
        };
      }

      acc[t._id].assignments.push({
        subject: rec.subject?.subName || '—',
        class: rec.sclassName?.sclassName || '—',
        sessions: rec.sessions || 0
      });

      return acc;
    }, {});

    res.send(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

//  Получить предметы и классы, которые ведёт учитель
exports.getClassesAndSubjectsByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const records = await TeacherSubjectClass.find({ teacher: teacherId })
      .populate('sclassName', 'sclassName')
      .populate('subject', 'subName');

    const formatted = records.map(rec => ({
      _id: rec._id,
      sclassId: rec.sclassName._id,
      sclassName: rec.sclassName.sclassName,
      subjectId: rec.subject._id,
      subjectName: rec.subject.subName,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Ошибка при получении классов и предметов учителя:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

//  Обновить связь
exports.updateTeacherSubjectClass = async (req, res) => {
  try {
    const { teacherId, subjectId, classId, sessions } = req.body; //  правильные поля
    const { id } = req.params;

    const updated = await TeacherSubjectClass.findByIdAndUpdate(
      id,
      {
        teacher: teacherId,
        subject: subjectId,
        sclassName: classId,
        sessions,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Запись для обновления не найдена" });
    }

    res.status(200).json({ message: "Запись обновлена", updated });
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
    res.status(500).json({ message: "Ошибка обновления связи", error: error.message });
  }
};

//  Удалить
exports.deleteTeacherSubjectClass = async (req, res) => {
  try {
    const record = await TeacherSubjectClass.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Связь не найдена" });
    }

    res.status(200).json({ message: "Назначение удалено", record });
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    res.status(500).json({ message: "Ошибка удаления связи", error: error.message });
  }
};

// Получить все назначения по школе
exports.getTeacherSubjectClassBySchool = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const records = await TeacherSubjectClass.find({ school: schoolId })
      .populate('teacher', 'name email')
      .populate('subject', 'subName')
      .populate('sclassName', 'sclassName');

    res.status(200).json(records);
  } catch (error) {
    console.error("Ошибка при получении teacherSubjectClass по школе:", error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};
