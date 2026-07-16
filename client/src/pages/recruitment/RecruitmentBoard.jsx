import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdAdd } from 'react-icons/md';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { recruitmentService, departmentService } from '../../services';

const STAGES = [
  { key: 'applied', label: 'Applied', accent: 'bg-black/10' },
  { key: 'screening', label: 'Screening', accent: 'bg-brutal-yellow' },
  { key: 'interview', label: 'Interview', accent: 'bg-brutal-blue text-white' },
  { key: 'offered', label: 'Offered', accent: 'bg-brutal-orange' },
  { key: 'hired', label: 'Hired', accent: 'bg-brutal-green' },
  { key: 'rejected', label: 'Rejected', accent: 'bg-brutal-pink text-white' },
];

const NEXT_STAGE = {
  applied: 'screening',
  screening: 'interview',
  interview: 'offered',
  offered: 'hired',
};

export default function RecruitmentBoard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: departmentsData } = useQuery({
    queryKey: ['departments-lookup'],
    queryFn: () => departmentService.list({ limit: 100 }).then((res) => res.data.data),
  });

  const { data: board, isLoading } = useQuery({
    queryKey: ['recruitment-board'],
    queryFn: () => recruitmentService.getCandidates().then((res) => res.data.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['recruitment-board'] });

  const advanceStage = async (candidate) => {
    const next = NEXT_STAGE[candidate.status];
    if (!next) return;
    try {
      await recruitmentService.moveStage(candidate._id, next);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const rejectCandidate = async (candidate) => {
    try {
      await recruitmentService.moveStage(candidate._id, 'rejected');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const onSubmit = async (values) => {
    try {
      await recruitmentService.create(values);
      toast.success('Candidate added to pipeline');
      reset();
      setIsFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Recruitment Pipeline</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Add Candidate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.key}>
            <div className={`${stage.accent} border-brutal border-black rounded-brutal-sm px-3 py-2 mb-3 text-center font-display font-bold text-sm`}>
              {stage.label} ({board?.[stage.key]?.length || 0})
            </div>
            <div className="space-y-3 min-h-[80px]">
              {isLoading ? (
                <Card className="h-20 animate-pulse" />
              ) : (
                board?.[stage.key]?.map((candidate) => (
                  <Card key={candidate._id} className="p-3">
                    <p className="font-display font-bold text-sm">{candidate.name}</p>
                    <p className="text-xs text-black/60">{candidate.positionAppliedFor}</p>
                    {candidate.department?.name && (
                      <p className="text-xs text-black/40">{candidate.department.name}</p>
                    )}
                    {!['hired', 'rejected'].includes(candidate.status) && (
                      <div className="flex gap-2 mt-2">
                        {NEXT_STAGE[candidate.status] && (
                          <button
                            onClick={() => advanceStage(candidate)}
                            className="text-xs font-bold underline hover:text-brutal-green"
                          >
                            Advance →
                          </button>
                        )}
                        <button
                          onClick={() => rejectCandidate(candidate)}
                          className="text-xs font-bold underline hover:text-brutal-pink"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Candidate">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Required' })}
          />
          <Input label="Phone" {...register('phone')} />
          <Input
            label="Position applied for"
            error={errors.positionAppliedFor?.message}
            {...register('positionAppliedFor', { required: 'Required' })}
          />
          <Select
            label="Department"
            placeholder="Select department"
            options={(departmentsData || []).map((d) => ({ value: d._id, label: d.name }))}
            {...register('department')}
          />
          <Input label="Expected salary" type="number" {...register('expectedSalary')} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Candidate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
