/**
 * Centralized Role & Permission configuration.
 * This is the single source of truth for RBAC across the system.
 * Every role maps to a set of permission keys checked by the
 * `permission` middleware. Super Admin bypasses all checks.
 */

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR: 'hr',
  TEAM_LEADER: 'team_leader',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
});

const PERMISSIONS = Object.freeze({
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_EMPLOYEES: 'manage_employees',
  MANAGE_DEPARTMENTS: 'manage_departments',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_ATTENDANCE: 'manage_attendance',
  MANAGE_PAYROLL: 'manage_payroll',
  MANAGE_LEAVES: 'manage_leaves',
  APPROVE_LEAVES: 'approve_leaves',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
  MANAGE_RECRUITMENT: 'manage_recruitment',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_TEAMS: 'manage_teams',
  APPROVE_TIMESHEETS: 'approve_timesheets',
  VIEW_OWN_DATA: 'view_own_data',
  RAISE_TICKETS: 'raise_tickets',
});

// Role -> Permissions mapping
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // all permissions
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.MANAGE_LEAVES,
    PERMISSIONS.APPROVE_LEAVES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_TEAMS,
  ],
  [ROLES.HR]: [
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.APPROVE_LEAVES,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.MANAGE_RECRUITMENT,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.TEAM_LEADER]: [
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.APPROVE_TIMESHEETS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.EMPLOYEE]: [PERMISSIONS.VIEW_OWN_DATA],
  [ROLES.CLIENT]: [PERMISSIONS.VIEW_OWN_DATA, PERMISSIONS.RAISE_TICKETS],
});

module.exports = { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
