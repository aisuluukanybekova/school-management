const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'SClass', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  term: { type: Number, required: true },
  day: { type: String, required: true },
  date: { type: String, required: true }, // <-- новинка!
  startTime: { type: String, required: true },
  topic: { type: String, default: '' },
  homework: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('LessonTopic', topicSchema);
