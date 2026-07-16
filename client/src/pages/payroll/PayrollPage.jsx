import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import PayrollAdmin from './PayrollAdmin';
import MyPayroll from './MyPayroll';

const MANAGER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR];

export default function PayrollPage() {
  const { user } = useAuth();
  if (MANAGER_ROLES.includes(user?.role)) return <PayrollAdmin />;
  return <MyPayroll />;
}
