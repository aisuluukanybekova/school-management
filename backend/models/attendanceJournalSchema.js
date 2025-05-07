const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Отсутствовал'],
    required: true,
  }
}, { _id: false });

const attendanceJournalSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
  },
  term: {
    type: Number,
    required: true,
  },
  records: [statusSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceJournal', attendanceJournalSchema);
