import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import LeaveApprovalQueue from './LeaveApprovalQueue';
import MyLeaves from './MyLeaves';

const APPROVER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER];

/** Routes to the approval queue for management roles, self-service view for everyone else. */
export default function LeavesPage() {
  const { user } = useAuth();
  if (APPROVER_ROLES.includes(user?.role)) return <LeaveApprovalQueue />;
  return <MyLeaves />;
}
