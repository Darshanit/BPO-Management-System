const Employee = require('../models/Employee');

/**
 * Generates a sequential employee ID scoped to the current year, e.g. EMP-2026-0001.
 * Looks up the highest existing number for the year and increments it.
 */
const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;

  const lastEmployee = await Employee.findOne({ employeeId: new RegExp(`^${prefix}`) })
    .sort({ employeeId: -1 })
    .lean();

  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.employeeId.split('-').pop(), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generateEmployeeId;
