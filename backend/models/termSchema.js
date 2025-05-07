const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  termNumber: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.term || mongoose.model("term", termSchema);
