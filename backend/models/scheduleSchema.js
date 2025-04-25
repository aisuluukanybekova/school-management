const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  schedule: {
    type: Map,
    of: Map,
    default: {},
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
