// routes/timeslots.js
const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/timeSlotSchema');

//  Получить все слоты по школе и смене
router.get('/:schoolId', async (req, res) => {
  try {
    const { shift } = req.query;
    const filter = { schoolId: req.params.schoolId };
    if (shift) filter.shift = shift;

    const slots = await TimeSlot.find(filter).sort('number');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения слотов', error: err.message });
  }
});

//  Создать новый слот
router.post('/', async (req, res) => {
  try {
    const slot = await TimeSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка создания слота', error: err.message });
  }
});

//  Обновить слот
router.put('/:id', async (req, res) => {
  try {
    const updated = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка обновления слота', error: err.message });
  }
});

//  Удалить один слот
router.delete('/:id', async (req, res) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Слот удалён' });
  } catch (err) {
    res.status(400).json({ message: 'Ошибка удаления слота', error: err.message });
  }
});

//  Удалить все слоты по школе и смене
router.delete('/all/:schoolId', async (req, res) => {
  try {
    const { shift } = req.query;
    const filter = { schoolId: req.params.schoolId };
    if (shift) filter.shift = shift;

    await TimeSlot.deleteMany(filter);
    res.json({ message: 'Все таймслоты удалены для указанной смены' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления всех слотов', error: err.message });
  }
});

// Массовая вставка (bulk create)
router.post('/bulk', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Массив слотов пуст или не передан' });
    }

    const inserted = await TimeSlot.insertMany(req.body);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка массового добавления', error: err.message });
  }
});

module.exports = router;
