const mongoose = require('mongoose');

const teacherSubjectClassSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    required: true,
  },
  sessions: {
    type: Number,
    required: true,
    min: 1,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
}, { timestamps: true });

// Защита от OverwriteModelError
module.exports = mongoose.models.teacherSubjectClass || mongoose.model('teacherSubjectClass', teacherSubjectClassSchema);
