import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { attendanceService } from '../../services';

export default function AttendanceOverview() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['all-attendance', page],
    queryFn: () => attendanceService.getAll({ page, limit: 10, sort: '-date' }).then((res) => res.data),
  });

  const columns = [
    { key: 'employee', label: 'Employee', render: (row) => row.employee?.user?.name },
    { key: 'department', label: 'Department', render: (row) => row.employee?.department?.name },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'workingHours', label: 'Hours', render: (row) => row.workingHours?.toFixed(2) || '0.00' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    { key: 'isLate', label: 'Late', render: (row) => (row.isLate ? <Badge status="high">Late</Badge> : '—') },
  ];

  return (
    <div className="space-y-3">
      <h2 className="font-display font-bold text-lg">Organization-wide Attendance</h2>
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No records found" />
      <Pagination meta={data?.meta} onPageChange={setPage} />
    </div>
  );
}
