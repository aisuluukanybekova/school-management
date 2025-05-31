const mongoose = require('mongoose');

const cabinetSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Cabinet', cabinetSchema);
