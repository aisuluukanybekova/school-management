const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  termNumber: {
    type: Number,
    required: true,
    validate: {
      validator: async function (value) {
        const existing = await this.constructor.findOne({
          school: this.school,
          termNumber: value,
          _id: { $ne: this._id }
        });
        return !existing;
      },
      message: 'Эта четверть уже существует для школы'
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v > this.startDate;
      },
      message: 'Дата окончания должна быть позже даты начала'
    }
  },
  workingDays: {
    type: Number
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Term', termSchema);
