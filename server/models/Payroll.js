const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    baseSalary: { type: Number, required: true, min: 0 },
    allowances: [
      {
        label: String, // e.g. 'HRA', 'Travel Allowance'
        amount: Number,
      },
    ],
    bonus: { type: Number, default: 0 },
    deductions: [
      {
        label: String, // e.g. 'Late Penalty'
        amount: Number,
      },
    ],
    tax: { type: Number, default: 0 },
    pf: { type: Number, default: 0 }, // provident fund contribution

    grossSalary: { type: Number, required: true },
    netSalary: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'processed', 'paid', 'failed'],
      default: 'pending',
    },
    paidOn: Date,
    payslipUrl: String, // generated PDF path

    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One payroll record per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
