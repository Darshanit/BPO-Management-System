const mongoose = require('mongoose');

/** Human-readable activity feed entries (e.g. "John completed task X"). */
const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'task.completed'
    description: { type: String, required: true },
    relatedTo: {
      kind: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

/** Security-sensitive audit trail (logins, permission changes, deletions). */
const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. 'user.login', 'employee.deleted'
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

/** Singleton-style application settings document. */
const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'BPO Management System' },
    logoUrl: String,
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    weekOffDays: [{ type: Number, default: [0, 6] }], // 0=Sunday, 6=Saturday
    holidays: [{ name: String, date: Date }],
    leavePolicy: {
      casual: { type: Number, default: 12 },
      medical: { type: Number, default: 10 },
      paid: { type: Number, default: 15 },
    },
    payrollCycle: { type: String, default: 'monthly' },
  },
  { timestamps: true }
);

/** Saved/generated report metadata (actual export happens on-demand, this tracks history). */
const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'attendance',
        'payroll',
        'leave',
        'employee',
        'department',
        'project',
        'performance',
      ],
      required: true,
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filters: mongoose.Schema.Types.Mixed, // date range, department, employee, etc.
    format: { type: String, enum: ['pdf', 'csv'], required: true },
    fileUrl: String,
  },
  { timestamps: true }
);

module.exports = {
  ActivityLog: mongoose.model('ActivityLog', activityLogSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Report: mongoose.model('Report', reportSchema),
};
