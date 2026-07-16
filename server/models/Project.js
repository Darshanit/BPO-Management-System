const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dueDate: Date,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: true, timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],

    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },

    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },

    milestones: [milestoneSchema],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

    budget: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ teamLeader: 1 });

module.exports = mongoose.model('Project', projectSchema);
