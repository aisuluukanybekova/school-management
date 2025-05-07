const Notice = require('../models/noticeSchema.js');

//  Создать объявление
const noticeCreate = async (req, res) => {
  try {
    const { schoolId, title, details, date } = req.body;

    if (!schoolId || !title || !details || !date) {
      return res.status(400).json({ message: 'Недостаточно данных для создания объявления' });
    }

    const notice = new Notice({
      title,
      details,
      date,
      school: schoolId,
    });

    const result = await notice.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Ошибка при создании объявления:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить все объявления школы
const noticeList = async (req, res) => {
  try {
    const notices = await Notice.find({ school: req.params.schoolId }).sort({ createdAt: -1 });

    if (!notices.length) {
      return res.status(404).json({ message: 'Объявления не найдены' });
    }

    res.status(200).json(notices);
  } catch (error) {
    console.error('Ошибка при получении объявлений:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновить объявление
const updateNotice = async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }

    res.status(200).json(updatedNotice);
  } catch (error) {
    console.error('Ошибка при обновлении объявления:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Удалить одно объявление
const deleteNotice = async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);

    if (!deletedNotice) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }

    res.status(200).json(deletedNotice);
  } catch (error) {
    console.error('Ошибка при удалении объявления:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Удалить все объявления школы
const deleteNotices = async (req, res) => {
  try {
    const result = await Notice.deleteMany({ school: req.params.schoolId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Нет объявлений для удаления' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Ошибка при удалении всех объявлений:', error.message);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

module.exports = {
  noticeCreate,
  noticeList,
  updateNotice,
  deleteNotice,
  deleteNotices,
};
