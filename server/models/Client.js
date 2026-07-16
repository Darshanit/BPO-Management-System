const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    contactPerson: {
      name: { type: String, required: true },
      designation: String,
      phone: String,
      email: String,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Invoices kept as a lightweight embedded sub-collection since they're always accessed via client
clientSchema.add({
  invoices: [
    {
      invoiceNumber: String,
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      amount: Number,
      status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
      dueDate: Date,
      paidOn: Date,
    },
  ],
});

module.exports = mongoose.model('Client', clientSchema);
