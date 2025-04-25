const Schedule = require('../models/scheduleSchema');

// Create or update schedule
const saveSchedule = async (req, res) => {
  const { teacherId, schedule } = req.body;

  try {
    let existing = await Schedule.findOne({ teacherId });

    if (existing) {
      existing.schedule = schedule;
      await existing.save();
      return res.status(200).json({ message: 'Расписание обновлено', data: existing });
    } else {
      const newSchedule = new Schedule({ teacherId, schedule });
      await newSchedule.save();
      return res.status(201).json({ message: 'Расписание создано', data: newSchedule });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get schedule
const getSchedule = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const schedule = await Schedule.findOne({ teacherId });
    if (!schedule) return res.status(404).json({ message: 'Расписание не найдено' });

    return res.status(200).json(schedule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { saveSchedule, getSchedule };
