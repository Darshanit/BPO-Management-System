import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdLogin, MdLogout, MdFreeBreakfast, MdPlayArrow } from 'react-icons/md';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { attendanceService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import AttendanceOverview from './AttendanceOverview';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendancePage() {
  const { user } = useAuth();
  const isManagement = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR].includes(user?.role);

  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ['my-attendance', month, year],
    queryFn: () => attendanceService.getMine({ month, year }).then((res) => res.data.data),
  });

  const today = records?.find((r) => {
    const d = new Date(r.date);
    return d.toDateString() === now.toDateString();
  });

  const hasOpenBreak = today?.breaks?.some((b) => b.start && !b.end);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['my-attendance'] });

  const runAction = async (fn, successMsg) => {
    try {
      await fn();
      toast.success(successMsg);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    {
      key: 'clockIn',
      label: 'Clock In',
      render: (row) => (row.clockIn ? new Date(row.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      key: 'clockOut',
      label: 'Clock Out',
      render: (row) => (row.clockOut ? new Date(row.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    { key: 'workingHours', label: 'Hours', render: (row) => row.workingHours?.toFixed(2) || '0.00' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    { key: 'isLate', label: 'Late', render: (row) => (row.isLate ? <Badge status="high">Late</Badge> : '—') },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Attendance</h1>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-lg">Today, {now.toLocaleDateString()}</p>
            <p className="text-black/60 font-semibold">
              {today?.clockIn
                ? today?.clockOut
                  ? 'Clocked out for the day ✅'
                  : `Clocked in at ${new Date(today.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not clocked in yet'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!today?.clockIn && (
              <Button variant="green" onClick={() => runAction(attendanceService.clockIn, 'Clocked in!')}>
                <MdLogin /> Clock In
              </Button>
            )}
            {today?.clockIn && !today?.clockOut && !hasOpenBreak && (
              <Button variant="yellow" onClick={() => runAction(attendanceService.startBreak, 'Break started')}>
                <MdFreeBreakfast /> Start Break
              </Button>
            )}
            {hasOpenBreak && (
              <Button variant="blue" onClick={() => runAction(attendanceService.endBreak, 'Break ended')}>
                <MdPlayArrow /> End Break
              </Button>
            )}
            {today?.clockIn && !today?.clockOut && (
              <Button variant="pink" onClick={() => runAction(attendanceService.clockOut, 'Clocked out!')}>
                <MdLogout /> Clock Out
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="font-display font-bold text-lg mb-3">
          {MONTH_NAMES[month - 1]} {year} History
        </h2>
        <Table columns={columns} data={records || []} isLoading={isLoading} emptyMessage="No attendance records yet" />
      </div>

      {isManagement && <AttendanceOverview />}
    </div>
  );
}
