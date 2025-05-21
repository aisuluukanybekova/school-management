const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');

// Регистрация администратора
const adminRegister = async (req, res) => {
    try {
        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            return res.status(400).send({ message: 'Email уже существует' });
        }
        if (existingSchool) {
            return res.status(400).send({ message: 'Школа с таким именем уже существует' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const admin = new Admin({
            ...req.body,
            password: hashedPassword
        });

        const result = await admin.save();
        result.password = undefined;

        // Формируем ответ с school объектом
        const userData = {
            _id: result._id,
            name: result.name,
            email: result.email,
            role: 'Admin',
            school: {
                _id: result._id,
                schoolName: result.schoolName
            }
        };

        res.send(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
};

// Логин администратора
const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        try {
            const admin = await Admin.findOne({ email: req.body.email });

            if (!admin) {
                return res.status(400).send({ message: "Пользователь не найден" });
            }

            const isValid = await bcrypt.compare(req.body.password, admin.password);
            if (!isValid) {
                return res.status(400).send({ message: "Неверный пароль" });
            }

            const userData = {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'Admin',
                school: {
                    _id: admin._id,
                    schoolName: admin.schoolName
                }
            };

            res.send(userData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка сервера при логине' });
        }
    } else {
        res.status(400).send({ message: "Email и пароль обязательны" });
    }
};

// Получение информации об администраторе
const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            const userData = {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'Admin',
                school: {
                    _id: admin._id,
                    schoolName: admin.schoolName
                }
            };
            res.send(userData);
        } else {
            res.status(404).send({ message: "Администратор не найден" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении данных' });
    }
};

// Обновление информации администратора
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

        const userData = {
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: 'Admin',
            school: {
                _id: updatedAdmin._id,
                schoolName: updatedAdmin.schoolName
            }
        };

        res.send(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении данных' });
    }
};
// Смена пароля администратора
const updateAdminPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Администратор не найден' });
        }

        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Старый пароль неверный' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        admin.password = hashedPassword;

        await admin.save();

        res.status(200).json({ message: 'Пароль успешно обновлён' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера при обновлении пароля' });
    }
};

// Экспорт всех функций
module.exports = {
    adminRegister,
    adminLogIn,
    getAdminDetail,
    updateAdmin,
    updateAdminPassword,
};

