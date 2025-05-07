const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: { type: String, default: "teacher" },

  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },

  teachSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },

  teachSclass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
  },

  homeroomFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    default: null,
  },

  attendance: [{
    date: { type: Date, required: true },
    presentCount: String,
    absentCount: String,
  }]
}, { timestamps: true });

module.exports = mongoose.model("teacher", teacherSchema);
