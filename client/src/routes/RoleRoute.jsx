import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Usage: <Route element={<RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>...</Route> */
export default function RoleRoute({ allow = [] }) {
  const { user } = useAuth();

  if (!allow.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
