// models/timeSlotSchema.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  startTime: {
    type: String,
    required: true // Пример: '08:00'
  },
  endTime: {
    type: String,
    required: true // Пример: '08:45'
  },
  type: {
    type: String,
    enum: ['lesson', 'break'],
    required: true
  },
  shift: {
    type: String,
    enum: ['first', 'second'],
    default: 'first'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
