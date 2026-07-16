import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdAdd } from 'react-icons/md';

import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { leaveService, employeeService } from '../../services';

export default function MyLeaves() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: profile } = useQuery({
    queryKey: ['my-employee-profile'],
    queryFn: () => employeeService.getMyProfile().then((res) => res.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => leaveService.getMine().then((res) => res.data.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['my-leaves'] });

  const onSubmit = async (values) => {
    try {
      await leaveService.apply(values);
      toast.success('Leave request submitted');
      reset();
      setIsFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveService.cancel(id);
      toast.success('Leave request cancelled');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const columns = [
    { key: 'leaveType', label: 'Type', render: (row) => <Badge>{row.leaveType}</Badge> },
    {
      key: 'dates',
      label: 'Dates',
      render: (row) =>
        `${new Date(row.startDate).toLocaleDateString()} – ${new Date(row.endDate).toLocaleDateString()}`,
    },
    { key: 'totalDays', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.status === 'pending' ? (
          <Button size="sm" variant="pink" onClick={() => handleCancel(row._id)}>
            Cancel
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">My Leaves</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Apply for Leave
        </Button>
      </div>

      {profile?.leaveBalance && (
        <div className="grid grid-cols-3 gap-4">
          {['casual', 'medical', 'paid'].map((type) => (
            <div key={type} className="card-brutal text-center">
              <p className="text-2xl font-bold">{profile.leaveBalance[type]}</p>
              <p className="text-xs font-semibold text-black/50 uppercase">{type} left</p>
            </div>
          ))}
        </div>
      )}

      <Table columns={columns} data={data || []} isLoading={isLoading} emptyMessage="No leave requests yet" />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Leave type"
            placeholder="Select type"
            options={[
              { value: 'casual', label: 'Casual' },
              { value: 'medical', label: 'Medical' },
              { value: 'paid', label: 'Paid' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'unpaid', label: 'Unpaid' },
            ]}
            error={errors.leaveType?.message}
            {...register('leaveType', { required: 'Required' })}
          />
          <Input
            label="Start date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate', { required: 'Required' })}
          />
          <Input
            label="End date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate', { required: 'Required' })}
          />
          <div>
            <label className="block font-display font-bold text-sm mb-2">Reason</label>
            <textarea
              className="input-brutal"
              rows={3}
              {...register('reason', { required: 'Reason is required' })}
            />
            {errors.reason && <p className="mt-1 text-sm font-semibold text-brutal-pink">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
