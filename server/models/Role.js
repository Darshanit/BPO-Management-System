const mongoose = require('mongoose');

/**
 * Permission Schema
 * Fine-grained, DB-stored permissions so Super Admin can create custom
 * permissions beyond the static config/roles.js matrix at runtime.
 */
const permissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // e.g. 'manage_payroll'
    label: { type: String, required: true },
    module: { type: String, required: true }, // e.g. 'Payroll'
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

/**
 * Role Schema
 * DB-stored roles referencing Permission documents. Complements the static
 * ROLES enum in config/roles.js so Super Admin can create custom roles
 * (e.g. "Regional Manager") with a custom permission set.
 */
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    isSystemRole: { type: Boolean, default: false }, // true for the 6 built-in roles
  },
  { timestamps: true }
);

module.exports = {
  Permission: mongoose.model('Permission', permissionSchema),
  Role: mongoose.model('Role', roleSchema),
};
