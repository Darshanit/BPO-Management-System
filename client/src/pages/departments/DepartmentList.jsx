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
import { departmentService } from '../../services';

export default function DepartmentList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.list({ limit: 100 }).then((res) => res.data),
  });

  const onSubmit = async (values) => {
    try {
      await departmentService.create(values);
      toast.success('Department created successfully');
      reset();
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <Badge status={row.isActive ? 'active' : 'inactive'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Departments</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Add Department
        </Button>
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No departments yet" />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Department">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Department name"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Code (e.g. ENG)"
            error={errors.code?.message}
            {...register('code', { required: 'Code is required' })}
          />
          <div>
            <label className="block font-display font-bold text-sm mb-2">Description</label>
            <textarea className="input-brutal" rows={3} {...register('description')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="white" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
