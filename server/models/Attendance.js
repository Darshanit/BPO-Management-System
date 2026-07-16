const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true }, // normalized to midnight for uniqueness per day
    clockIn: { type: Date },
    clockOut: { type: Date },
    breaks: [
      {
        start: Date,
        end: Date,
      },
    ],
    workingHours: { type: Number, default: 0 }, // computed in minutes -> stored as hours
    status: {
      type: String,
      enum: ['present', 'absent', 'half_day', 'on_leave', 'holiday', 'weekend'],
      default: 'present',
    },
    isLate: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
