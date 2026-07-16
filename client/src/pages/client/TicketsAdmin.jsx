import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import { clientService } from '../../services';

export default function TicketsAdmin() {
  const [page, setPage] = useState(1);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets-admin', page],
    queryFn: () => clientService.getAllTickets({ page, limit: 10, sort: '-createdAt' }).then((res) => res.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['tickets-admin'] });

  const openTicket = (ticket) => {
    setActiveTicket(ticket);
    setStatusUpdate(ticket.status);
  };

  const submitReply = async () => {
    try {
      await clientService.replyToTicket(activeTicket._id, {
        message: replyText || undefined,
        status: statusUpdate,
      });
      toast.success('Ticket updated');
      setReplyText('');
      setActiveTicket(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  const columns = [
    { key: 'ticketNumber', label: 'Ticket #' },
    { key: 'client', label: 'Client', render: (row) => row.raisedBy?.companyName },
    { key: 'subject', label: 'Subject' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge status={row.priority}>{row.priority}</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button size="sm" variant="blue" onClick={() => openTicket(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Support Tickets</h1>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No tickets found" />
      <Pagination meta={data?.meta} onPageChange={setPage} />

      <Modal isOpen={!!activeTicket} onClose={() => setActiveTicket(null)} title={activeTicket?.subject}>
        <div className="space-y-4">
          <p className="text-black/70">{activeTicket?.description}</p>

          <div>
            <h4 className="font-display font-bold text-sm mb-2">Replies</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeTicket?.replies?.length ? (
                activeTicket.replies.map((r, idx) => (
                  <div key={idx} className="border-2 border-black/10 rounded-brutal-sm p-2">
                    <p className="text-sm">{r.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-black/40 text-sm">No replies yet.</p>
              )}
            </div>
          </div>

          <textarea
            className="input-brutal"
            rows={3}
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <Select
            label="Update status"
            value={statusUpdate}
            onChange={(e) => setStatusUpdate(e.target.value)}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />

          <div className="flex justify-end gap-3">
            <Button variant="white" onClick={() => setActiveTicket(null)}>
              Cancel
            </Button>
            <Button variant="green" onClick={submitReply}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
