const mongoose = require('mongoose');

const gradebookSchema = new mongoose.Schema({
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
    enum: ['1', '2', '3', '4'], // четверть
    required: true,
  },
  grades: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      values: [
        {
          date: Date,
          grade: Number,
        },
      ],
    },
  ],
}, {
  timestamps: true
});

module.exports = mongoose.model('Gradebook', gradebookSchema);
