const mongoose = require('mongoose');

/**
 * Employee Schema
 * Extends a User (role: employee/team_leader/hr/admin/super_admin) with
 * HR-specific profile data. One-to-one relationship with User via `user`.
 */
const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true, // auto-generated, e.g. EMP-2026-0001
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },

    salary: {
      base: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
    },

    joiningDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      default: 'full_time',
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'on_leave', 'suspended', 'terminated'],
      default: 'active',
    },

    dob: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    skills: [{ type: String, trim: true }],
    experience: [
      {
        company: String,
        role: String,
        from: Date,
        to: Date,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        yearOfCompletion: Number,
      },
    ],

    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

    performanceHistory: [
      {
        reviewDate: Date,
        rating: { type: Number, min: 1, max: 5 },
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        comments: String,
      },
    ],

    leaveBalance: {
      casual: { type: Number, default: 12 },
      medical: { type: Number, default: 10 },
      paid: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1, employmentStatus: 1 });
employeeSchema.index({ manager: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
