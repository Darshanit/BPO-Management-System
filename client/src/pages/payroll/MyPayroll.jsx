import { useQuery } from '@tanstack/react-query';
import { MdDownload } from 'react-icons/md';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { payrollService } from '../../services';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function MyPayroll() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-payroll'],
    queryFn: () => payrollService.getMine().then((res) => res.data.data),
  });

  const columns = [
    { key: 'period', label: 'Period', render: (row) => `${MONTH_NAMES[row.month - 1]} ${row.year}` },
    { key: 'grossSalary', label: 'Gross Salary', render: (row) => `₹${row.grossSalary.toLocaleString()}` },
    { key: 'netSalary', label: 'Net Salary', render: (row) => `₹${row.netSalary.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    {
      key: 'payslip',
      label: 'Payslip',
      render: (row) =>
        row.payslipUrl ? (
          <a href={row.payslipUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="blue">
              <MdDownload /> Download
            </Button>
          </a>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">My Payroll</h1>
      <Table columns={columns} data={data || []} isLoading={isLoading} emptyMessage="No payroll records yet" />
    </div>
  );
}
