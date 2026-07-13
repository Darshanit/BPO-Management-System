const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },

    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'completed'],
      default: 'todo',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

    dueDate: Date,
    completedAt: Date,

    comments: [commentSchema],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

    // Denormalized ordering value for drag-and-drop kanban positioning within a status column
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', taskSchema);
