const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: function () {
      return this.type === 'lesson';
    },
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: function () {
      return this.type === 'lesson';
    },
  },
  day: {
    type: String,
    required: true,
    enum: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ],
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/, // формат HH:MM
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/, // формат HH:MM
  },
  type: {
    type: String,
    enum: ['lesson', 'break'],
    required: true,
  },
  shift: {
    type: String,
    enum: ['first', 'second'],
    default: 'first',
  },
  topic: {
    type: String,
    default: '',
  },
  homework: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
