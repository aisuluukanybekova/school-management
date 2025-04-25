const mongoose = require('mongoose');

const attendanceJournalSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  term: {
    type: String,
    enum: ['1', '2', '3', '4'],
    required: true,
  },
  records: [
    {
      date: Date,
      statuses: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
          },
          status: {
            type: String,
            enum: ['Присутствовал', 'Отсутствовал'],
            default: 'Присутствовал'
          }
        }
      ]
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceJournal', attendanceJournalSchema);
