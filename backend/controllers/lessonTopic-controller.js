const Topic = require('../models/lessonTopicSchema');

exports.saveTopics = async (req, res) => {
  const { classId, subjectId, teacherId, term, lessons } = req.body;

  try {
    for (const lesson of lessons) {
      const { day, date, startTime, topic, homework } = lesson;

      const existing = await Topic.findOne({
        classId,
        subjectId,
        teacherId,
        term,
        day,
        date,
        startTime
      });

      if (existing) {
        existing.topic = topic;
        existing.homework = homework;
        await existing.save();
      } else {
        await Topic.create({
          classId,
          subjectId,
          teacherId,
          term,
          day,
          date,
          startTime,
          topic,
          homework
        });
      }
    }

    res.status(200).json({ message: 'Темы успешно сохранены' });
  } catch (err) {
    console.error("Ошибка сохранения тем:", err.message);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};
exports.getTopics = async (req, res) => {
  const { classId, subjectId, term, date } = req.query;

  try {
    const query = { classId, subjectId, term };
    if (date) query.date = date;

    const topics = await Topic.find(query);
    res.json(topics);
  } catch (err) {
    console.error("Ошибка получения тем:", err.message);
    res.status(500).json({ message: 'Ошибка получения тем', error: err.message });
  }
};

