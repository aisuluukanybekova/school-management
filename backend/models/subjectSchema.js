const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subName: {
    type: String,
    required: true,
  },
  sessions: {
    type: String,     // можно оставить строкой, но лучше использовать Number
    required: false,  //  теперь не обязательно
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sclass',
    required: false,  //  можно сделать необязательным, если форма не указывает
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
  }
}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);
