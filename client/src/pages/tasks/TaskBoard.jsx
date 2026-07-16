import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdAdd, MdArrowForward } from 'react-icons/md';

import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { taskService, projectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';

const COLUMNS = [
  { key: 'todo', label: 'To Do', accent: 'bg-black/10' },
  { key: 'in_progress', label: 'In Progress', accent: 'bg-brutal-blue text-white' },
  { key: 'review', label: 'Review', accent: 'bg-brutal-orange' },
  { key: 'completed', label: 'Completed', accent: 'bg-brutal-green' },
];

const NEXT_COLUMN = { todo: 'in_progress', in_progress: 'review', review: 'completed' };

export default function TaskBoard() {
  const { user } = useAuth();
  const canManageTasks = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER].includes(user?.role);

  const [selectedProject, setSelectedProject] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeComments, setActiveComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: projects } = useQuery({
    queryKey: ['projects-lookup'],
    queryFn: () => projectService.list({ limit: 100 }).then((res) => res.data.data),
  });

  const { data: board, isLoading } = useQuery({
    queryKey: ['task-board', selectedProject],
    queryFn: () => taskService.getByProject(selectedProject).then((res) => res.data.data),
    enabled: !!selectedProject,
  });

  const { data: taskDetail } = useQuery({
    queryKey: ['task-detail', activeComments],
    queryFn: () => taskService.getById(activeComments).then((res) => res.data.data),
    enabled: !!activeComments,
  });

  const refreshBoard = () => queryClient.invalidateQueries({ queryKey: ['task-board', selectedProject] });

  const advanceTask = async (task) => {
    const next = NEXT_COLUMN[task.status];
    if (!next) return;
    try {
      await taskService.move(task._id, { status: next });
      refreshBoard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move task');
    }
  };

  const onSubmit = async (values) => {
    try {
      await taskService.create({
        ...values,
        project: selectedProject,
        assignedTo: values.assignedTo ? [values.assignedTo] : [],
      });
      toast.success('Task created');
      reset();
      setIsFormOpen(false);
      refreshBoard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await taskService.addComment(activeComments, commentText);
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['task-detail', activeComments] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Task Board</h1>
        {canManageTasks && selectedProject && (
          <Button variant="green" onClick={() => setIsFormOpen(true)}>
            <MdAdd size={20} /> Add Task
          </Button>
        )}
      </div>

      <Select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        placeholder="Select a project to view its board"
        options={(projects || []).map((p) => ({ value: p._id, label: p.name }))}
        className="sm:w-72"
      />

      {!selectedProject ? (
        <Card className="text-center py-16">
          <p className="font-display font-bold">Pick a project above to see its kanban board</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <div className={`${col.accent} border-brutal border-black rounded-brutal-sm px-3 py-2 mb-3 text-center font-display font-bold text-sm`}>
                {col.label} ({board?.[col.key]?.length || 0})
              </div>
              <div className="space-y-3 min-h-[80px]">
                {isLoading ? (
                  <Card className="h-20 animate-pulse" />
                ) : (
                  board?.[col.key]?.map((task) => (
                    <Card key={task._id} interactive className="p-3" onClick={() => setActiveComments(task._id)}>
                      <p className="font-display font-bold text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge status={task.priority}>{task.priority}</Badge>
                        {task.dueDate && (
                          <span className="text-xs text-black/40">{new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {NEXT_COLUMN[task.status] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceTask(task);
                          }}
                          className="mt-2 text-xs font-bold underline flex items-center gap-1 hover:text-brutal-blue"
                        >
                          <MdArrowForward /> Move to {COLUMNS.find((c) => c.key === NEXT_COLUMN[task.status])?.label}
                        </button>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Required' })} />
          <div>
            <label className="block font-display font-bold text-sm mb-2">Description</label>
            <textarea className="input-brutal" rows={3} {...register('description')} />
          </div>
          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            defaultValue="medium"
            {...register('priority')}
          />
          <Input label="Due date" type="date" {...register('dueDate')} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!activeComments} onClose={() => setActiveComments(null)} title={taskDetail?.title || 'Task'}>
        <div className="space-y-4">
          <p className="text-black/70">{taskDetail?.description || 'No description provided.'}</p>

          <div>
            <h4 className="font-display font-bold text-sm mb-2">Comments</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {taskDetail?.comments?.length ? (
                taskDetail.comments.map((c, idx) => (
                  <div key={idx} className="border-2 border-black/10 rounded-brutal-sm p-2">
                    <p className="text-xs font-bold">{c.author?.name || 'User'}</p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-black/40 text-sm">No comments yet.</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              className="input-brutal"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            />
            <Button variant="blue" onClick={submitComment}>
              Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
