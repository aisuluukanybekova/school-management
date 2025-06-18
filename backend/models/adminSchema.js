const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Admin",
  },
  schoolName: {
    type: String,
    required: true, 
  },
}, {
  timestamps: true //  Добавляем это
});

module.exports = mongoose.model("admin", adminSchema);
