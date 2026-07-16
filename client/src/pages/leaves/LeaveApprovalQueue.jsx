import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdCheck, MdClose } from 'react-icons/md';

import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { leaveService } from '../../services';

export default function LeaveApprovalQueue() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leaves', statusFilter],
    queryFn: () =>
      leaveService.getAll({ status: statusFilter || undefined }).then((res) => res.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['leaves'] });

  const handleApprove = async (id) => {
    try {
      await leaveService.approve(id);
      toast.success('Leave approved');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const submitRejection = async () => {
    try {
      await leaveService.reject(rejectTarget, rejectionReason);
      toast.success('Leave rejected');
      setRejectTarget(null);
      setRejectionReason('');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject leave');
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: (row) => row.employee?.user?.name },
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
      label: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="green" onClick={() => handleApprove(row._id)}>
              <MdCheck />
            </Button>
            <Button size="sm" variant="pink" onClick={() => setRejectTarget(row._id)}>
              <MdClose />
            </Button>
          </div>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Leave Approval Queue</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: '', label: 'All' },
          ]}
        />
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No leave requests found" />

      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Leave Request">
        <div className="space-y-4">
          <div>
            <label className="block font-display font-bold text-sm mb-2">Reason (optional)</label>
            <textarea
              className="input-brutal"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="white" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="pink" onClick={submitRejection}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
