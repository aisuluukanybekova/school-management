const mongoose = require('mongoose');

const gradebookSchema = new mongoose.Schema({
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
    ref: 'Teacher',
    required: true,
  },
  term: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: true,
  },
  grades: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      values: [
        {
          date: { type: String, required: true },
          grade: { type: Number, min: 1, max: 5 },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Gradebook', gradebookSchema);
