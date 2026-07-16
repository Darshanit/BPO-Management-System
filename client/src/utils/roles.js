/** Mirrors server/config/roles.js ROLES so the frontend can reference the same values. */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR: 'hr',
  TEAM_LEADER: 'team_leader',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
});

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.HR]: 'HR',
  [ROLES.TEAM_LEADER]: 'Team Leader',
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.CLIENT]: 'Client',
};
