const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  termNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    validate: {
      validator: async function (value) {
        // Проверяем, существует ли уже такая четверть для этой школы
        const existing = await this.constructor.findOne({
          school: this.school,
          termNumber: value,
          _id: { $ne: this._id } // исключить сам себя при обновлении
        });
        return !existing;
      },
      message: 'Эта четверть уже существует для данной школы.'
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
      message: 'Дата окончания должна быть позже даты начала.'
    }
  },
  workingDays: {
    type: Number,
    default: 0 // <-- Добавил значение по умолчанию для стабильности
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  }
}, { timestamps: true });

const Term = mongoose.model('Term', termSchema);
module.exports = Term;