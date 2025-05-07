const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNum: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
  role: {
    type: String,
    default: "Student"
  }
});

module.exports = mongoose.model("student", studentSchema);
