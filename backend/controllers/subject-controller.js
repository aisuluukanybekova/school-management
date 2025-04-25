const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

// ✅ Создание новых предметов (без subCode)
const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: req.body.sclassName,
            school: req.body.adminID,
        }));

        const result = await Subject.insertMany(subjects);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Обновление предмета
const updateSubject = async (req, res) => {
    try {
        const { subName, sessions } = req.body;
        const updated = await Subject.findByIdAndUpdate(
            req.params.id,
            { subName, sessions },
            { new: true }
        );
        res.send(updated);
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Получение всех предметов по школе
const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");

        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Получение предметов по классу
const classSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Список свободных предметов (без преподавателя)
const freeSubjectList = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Получение подробностей по предмету
const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (subject) {
            subject = await subject.populate("sclassName", "sclassName");
            subject = await subject.populate("teacher", "name");
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Удаление одного предмета
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id }, attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

// ✅ Удаление всех предметов по школе
const deleteSubjects = async (req, res) => {
    try {
        const subjectsToDelete = await Subject.find({ school: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: subjectsToDelete.map(sub => sub._id) } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany({}, { $set: { examResult: null, attendance: null } });

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

// ✅ Удаление всех предметов по классу
const deleteSubjectsByClass = async (req, res) => {
    try {
        const subjectsToDelete = await Subject.find({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: subjectsToDelete.map(sub => sub._id) } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany({}, { $set: { examResult: null, attendance: null } });

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

// ✅ Экспорт всех функций
module.exports = {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects,
    updateSubject
};
