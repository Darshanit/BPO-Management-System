import {
  MdDashboard,
  MdPeople,
  MdBusiness,
  MdCalendarToday,
  MdEventNote,
  MdPayments,
  MdWork,
  MdChecklist,
  MdGroups,
  MdSupportAgent,
  MdChat,
  MdNotifications,
  MdBarChart,
  MdSettings,
  MdPerson,
  MdWorkOutline,
  MdConfirmationNumber,
  MdReceiptLong,
} from 'react-icons/md';
import { ROLES } from './roles';

/**
 * Central nav map: each entry declares which roles can see it.
 * The Sidebar filters this list against the logged-in user's role.
 */
export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: MdDashboard, roles: 'all' },
  {
    label: 'Employees',
    to: '/employees',
    icon: MdPeople,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Departments',
    to: '/departments',
    icon: MdBusiness,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR],
  },
  { label: 'Attendance', to: '/attendance', icon: MdCalendarToday, roles: 'all' },
  { label: 'Leaves', to: '/leaves', icon: MdEventNote, roles: 'all' },
  {
    label: 'Payroll',
    to: '/payroll',
    icon: MdPayments,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE, ROLES.TEAM_LEADER],
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: MdWork,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER, ROLES.EMPLOYEE, ROLES.CLIENT],
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: MdChecklist,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER, ROLES.EMPLOYEE],
  },
  {
    label: 'Clients',
    to: '/clients',
    icon: MdSupportAgent,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    label: 'Support Tickets',
    to: '/tickets',
    icon: MdConfirmationNumber,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER, ROLES.CLIENT],
  },
  {
    label: 'Invoices',
    to: '/billing',
    icon: MdReceiptLong,
    roles: [ROLES.CLIENT],
  },
  {
    label: 'Teams',
    to: '/teams',
    icon: MdGroups,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER],
  },
  {
    label: 'Recruitment',
    to: '/recruitment',
    icon: MdWorkOutline,
    roles: [ROLES.SUPER_ADMIN, ROLES.HR],
  },
  { label: 'Chat', to: '/chat', icon: MdChat, roles: 'all' },
  { label: 'Notifications', to: '/notifications', icon: MdNotifications, roles: 'all' },
  {
    label: 'Reports',
    to: '/reports',
    icon: MdBarChart,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER],
  },
  { label: 'Profile', to: '/profile', icon: MdPerson, roles: 'all' },
  { label: 'Settings', to: '/settings', icon: MdSettings, roles: [ROLES.SUPER_ADMIN] },
];

export const getNavForRole = (role) =>
  NAV_ITEMS.filter((item) => item.roles === 'all' || item.roles.includes(role));
