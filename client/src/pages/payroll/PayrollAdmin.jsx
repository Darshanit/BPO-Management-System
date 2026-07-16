import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdAdd, MdCheck } from 'react-icons/md';

import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import { payrollService, employeeService } from '../../services';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function PayrollAdmin() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: employees } = useQuery({
    queryKey: ['employees-lookup'],
    queryFn: () => employeeService.list({ limit: 100 }).then((res) => res.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['payroll-admin', page],
    queryFn: () => payrollService.getAll({ page, limit: 10, sort: '-year,-month' }).then((res) => res.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['payroll-admin'] });

  const onSubmit = async (values) => {
    try {
      await payrollService.generate({
        employee: values.employee,
        month: Number(values.month),
        year: Number(values.year),
        bonus: Number(values.bonus) || 0,
        allowances: [],
        deductions: [],
      });
      toast.success('Payroll generated');
      reset();
      setIsFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollService.markAsPaid(id);
      toast.success('Marked as paid, payslip generated');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: (row) => row.employee?.user?.name },
    { key: 'period', label: 'Period', render: (row) => `${MONTH_NAMES[row.month - 1]} ${row.year}` },
    { key: 'grossSalary', label: 'Gross', render: (row) => `₹${row.grossSalary.toLocaleString()}` },
    { key: 'netSalary', label: 'Net', render: (row) => `₹${row.netSalary.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.status !== 'paid' ? (
          <Button size="sm" variant="green" onClick={() => handleMarkPaid(row._id)}>
            <MdCheck /> Mark Paid
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Payroll</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Generate Payroll
        </Button>
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No payroll records yet" />
      <Pagination meta={data?.meta} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Generate Payroll">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            options={(employees || []).map((e) => ({ value: e._id, label: e.user?.name }))}
            error={errors.employee?.message}
            {...register('employee', { required: 'Required' })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Month"
              options={MONTH_NAMES.map((m, idx) => ({ value: idx + 1, label: m }))}
              error={errors.month?.message}
              {...register('month', { required: 'Required' })}
            />
            <Input
              label="Year"
              type="number"
              defaultValue={new Date().getFullYear()}
              error={errors.year?.message}
              {...register('year', { required: 'Required' })}
            />
          </div>
          <Input label="Bonus (optional)" type="number" defaultValue={0} {...register('bonus')} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
