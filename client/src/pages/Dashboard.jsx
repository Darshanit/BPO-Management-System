import { useQuery } from '@tanstack/react-query';
import {
  MdPeople,
  MdCheckCircle,
  MdEventNote,
  MdWork,
  MdSupportAgent,
  MdAccessTime,
} from 'react-icons/md';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import StatusBreakdownChart from '../components/ui/StatusBreakdownChart';
import { dashboardService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';

export default function Dashboard() {
  const { user } = useAuth();
  const isManagement = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER].includes(
    user?.role
  );

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats().then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Dashboard</h1>

      {isManagement ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={data?.totalEmployees ?? 0} icon={MdPeople} accent="blue" />
            <StatCard label="Present Today" value={data?.presentToday ?? 0} icon={MdCheckCircle} accent="green" />
            <StatCard label="Pending Leaves" value={data?.pendingLeaves ?? 0} icon={MdEventNote} accent="yellow" />
            <StatCard label="Active Projects" value={data?.activeProjects ?? 0} icon={MdWork} accent="pink" />
            <StatCard label="Open Tickets" value={data?.openTickets ?? 0} icon={MdSupportAgent} accent="orange" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusBreakdownChart title="Task Overview" data={data?.taskOverview || []} />
            <StatusBreakdownChart title="Project Status" data={data?.projectStatus || []} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Clock Status"
            value={data?.clockedInToday ? (data?.clockedOutToday ? 'Done for today' : 'Clocked in') : 'Not clocked in'}
            icon={MdAccessTime}
            accent="blue"
          />
          <StatCard label="Pending Leaves" value={data?.myPendingLeaves ?? 0} icon={MdEventNote} accent="yellow" />
          <StatCard label="Unread Notifications" value={data?.unreadNotifications ?? 0} icon={MdSupportAgent} accent="pink" />
          <StatCard
            label="Leave Balance (Casual)"
            value={data?.leaveBalance?.casual ?? '-'}
            icon={MdCheckCircle}
            accent="green"
          />
        </div>
      )}

      <Card>
        <h2 className="font-display font-bold text-lg mb-2">What's next</h2>
        <p className="text-black/70">
          More widgets (recent activity feed, charts, quick actions, task overview) land in the
          dashboard build-out for your specific role.
        </p>
      </Card>
    </div>
  );
}
