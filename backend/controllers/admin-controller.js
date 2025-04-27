const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

// Регистрация администратора
const adminRegister = async (req, res) => {
    try {
        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            return res.send({ message: 'Email already exists' });
        }
        if (existingSchool) {
            return res.send({ message: 'School name already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const admin = new Admin({
            ...req.body,
            password: hashedPassword
        });

        const result = await admin.save();
        result.password = undefined;
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ✅ Логин администратора
const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        try {
            const admin = await Admin.findOne({ email: req.body.email });
            if (!admin) {
                return res.send({ message: "User not found" });
            }

            const isValid = await bcrypt.compare(req.body.password, admin.password);
            if (!isValid) {
                return res.send({ message: "Invalid password" });
            }

            admin.password = undefined;
            res.send(admin);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error during login' });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};
// Получение информации об администраторе
const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        } else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Обновление информации администратора
const updateAdmin = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        updatedAdmin.password = undefined;
        res.send(updatedAdmin);
    } catch (err) {
        res.status(500).json(err);
    }
};

// ✅ Экспорт
module.exports = {
    adminRegister,
    adminLogIn,
    getAdminDetail,
    updateAdmin
};
