const mongoose = require('mongoose');

/**
 * Candidate Schema
 * Tracks applicants through the HR recruitment pipeline, from application
 * to hire (at which point HR converts them into an Employee record).
 */
const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    positionAppliedFor: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied',
      index: true,
    },

    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    source: { type: String, default: 'direct' }, // e.g. 'referral', 'linkedin', 'job_board'
    expectedSalary: Number,

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    convertedToEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { timestamps: true }
);

candidateSchema.index({ status: 1, department: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
