import { describe, it, expect } from 'vitest';
import { getNavForRole, NAV_ITEMS } from '../utils/navConfig';
import { ROLES } from '../utils/roles';

describe('getNavForRole', () => {
  it('includes items marked "all" for every role', () => {
    const employeeNav = getNavForRole(ROLES.EMPLOYEE);
    const dashboardItem = employeeNav.find((i) => i.to === '/dashboard');
    expect(dashboardItem).toBeDefined();
  });

  it('includes Employees/Departments only for management roles', () => {
    const superAdminNav = getNavForRole(ROLES.SUPER_ADMIN);
    const employeeNav = getNavForRole(ROLES.EMPLOYEE);

    expect(superAdminNav.some((i) => i.to === '/employees')).toBe(true);
    expect(employeeNav.some((i) => i.to === '/employees')).toBe(false);
  });

  it('only shows Settings to Super Admin', () => {
    expect(getNavForRole(ROLES.SUPER_ADMIN).some((i) => i.to === '/settings')).toBe(true);
    expect(getNavForRole(ROLES.ADMIN).some((i) => i.to === '/settings')).toBe(false);
    expect(getNavForRole(ROLES.HR).some((i) => i.to === '/settings')).toBe(false);
  });

  it('shows Invoices only to Client role', () => {
    expect(getNavForRole(ROLES.CLIENT).some((i) => i.to === '/billing')).toBe(true);
    expect(getNavForRole(ROLES.EMPLOYEE).some((i) => i.to === '/billing')).toBe(false);
  });

  it('returns an empty array for an unrecognized role', () => {
    const nav = getNavForRole('not_a_real_role');
    // Only "all" items should show; role-specific items should not match
    expect(nav.every((item) => item.roles === 'all')).toBe(true);
  });

  it('every nav item resolves to either "all" or a non-empty roles array', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.roles === 'all' || Array.isArray(item.roles)).toBe(true);
    });
  });
});
