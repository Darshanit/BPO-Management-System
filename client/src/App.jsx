import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import DepartmentList from './pages/departments/DepartmentList';
import LeavesPage from './pages/leaves/LeavesPage';
import RecruitmentBoard from './pages/recruitment/RecruitmentBoard';
import AttendancePage from './pages/attendance/AttendancePage';
import PayrollPage from './pages/payroll/PayrollPage';
import TaskBoard from './pages/tasks/TaskBoard';
import ProjectsPage from './pages/projects/ProjectsPage';
import TicketsPage from './pages/client/TicketsPage';
import ClientBilling from './pages/client/ClientBilling';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFound from './pages/NotFound';

import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { ROLES } from './utils/roles';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected (any authenticated role) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leaves" element={<LeavesPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/chat" element={<PlaceholderPage title="Chat" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />

          <Route element={<RoleRoute allow={[ROLES.CLIENT]} />}>
            <Route path="/billing" element={<ClientBilling />} />
          </Route>

          <Route
            element={
              <RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER, ROLES.CLIENT]} />
            }
          >
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>

          {/* Management-only sections */}
          <Route
            element={
              <RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR]} />
            }
          >
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<DepartmentList />} />
          </Route>

          <Route element={<RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.HR]} />}>
            <Route path="/recruitment" element={<RecruitmentBoard />} />
          </Route>

          <Route element={<RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>
            <Route path="/clients" element={<PlaceholderPage title="Client Management" />} />
          </Route>

          <Route
            element={
              <RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER]} />
            }
          >
            <Route path="/teams" element={<PlaceholderPage title="Teams" />} />
          </Route>

          <Route
            element={
              <RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER]} />
            }
          >
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<RoleRoute allow={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
