/**
 * Run with: npm run seed
 * Creates the first Super Admin so there's a way to log in and start
 * creating Admins/HR/Employees/Clients through the app itself.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../config/roles');
const logger = require('./logger');

const seedSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) {
    logger.info(`Super Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@bpo.com',
    password: 'ChangeMe123!', // must be changed on first login
    role: ROLES.SUPER_ADMIN,
    isEmailVerified: true,
  });

  logger.info(`Super Admin created: ${superAdmin.email} / password: ChangeMe123!`);
  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
