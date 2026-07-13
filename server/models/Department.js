const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. 'ENG'
    description: { type: String, default: '' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // department head
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);
