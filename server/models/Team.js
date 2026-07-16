const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
