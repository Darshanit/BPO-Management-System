import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdAdd } from 'react-icons/md';

import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { clientService, projectService } from '../../services';

export default function ClientTickets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: projects } = useQuery({
    queryKey: ['my-client-projects'],
    queryFn: () => projectService.getMyClientProjects().then((res) => res.data.data),
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => clientService.getMyTickets().then((res) => res.data.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['my-tickets'] });

  const onSubmit = async (values) => {
    try {
      await clientService.raiseTicket(values);
      toast.success('Support ticket raised');
      reset();
      setIsFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise ticket');
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await clientService.replyToTicket(activeTicket._id, { message: replyText });
      setReplyText('');
      toast.success('Reply sent');
      refresh();
      setActiveTicket(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Support Tickets</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Raise Ticket
        </Button>
      </div>

      {isLoading ? (
        <Card className="h-32 animate-pulse" />
      ) : !tickets?.length ? (
        <Card className="text-center py-16">
          <p className="font-display font-bold">No support tickets yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket._id} interactive onClick={() => setActiveTicket(ticket)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-bold">{ticket.subject}</p>
                  <p className="text-xs text-black/50">{ticket.ticketNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Badge status={ticket.priority}>{ticket.priority}</Badge>
                  <Badge status={ticket.status}>{ticket.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-black/60 mt-2 line-clamp-2">{ticket.description}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Raise Support Ticket">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Related project (optional)"
            placeholder="None"
            options={(projects || []).map((p) => ({ value: p._id, label: p.name }))}
            {...register('project')}
          />
          <Input label="Subject" error={errors.subject?.message} {...register('subject', { required: 'Required' })} />
          <div>
            <label className="block font-display font-bold text-sm mb-2">Description</label>
            <textarea
              className="input-brutal"
              rows={4}
              {...register('description', { required: 'Description is required' })}
            />
          </div>
          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            defaultValue="medium"
            {...register('priority')}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </Modal>

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

          {activeTicket?.status !== 'closed' && (
            <div className="flex gap-2">
              <input
                className="input-brutal"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitReply()}
              />
              <Button variant="blue" onClick={submitReply}>
                Send
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
