import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { employeeService } from '../../services';

export default function EmployeeFormModal({ isOpen, onClose, onSuccess, departments }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await employeeService.create({
        ...values,
        salary: { base: Number(values.baseSalary), currency: 'INR' },
      });
      reset();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input
          label="Full name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Temporary password"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <Select
          label="Department"
          placeholder="Select department"
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
          error={errors.department?.message}
          {...register('department', { required: 'Department is required' })}
        />
        <Input
          label="Designation"
          error={errors.designation?.message}
          {...register('designation', { required: 'Designation is required' })}
        />
        <Input
          label="Base salary (monthly)"
          type="number"
          error={errors.baseSalary?.message}
          {...register('baseSalary', { required: 'Base salary is required' })}
        />
        <Input
          label="Joining date"
          type="date"
          error={errors.joiningDate?.message}
          {...register('joiningDate', { required: 'Joining date is required' })}
        />
        <Select
          label="Employment type"
          options={[
            { value: 'full_time', label: 'Full-time' },
            { value: 'part_time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
            { value: 'intern', label: 'Intern' },
          ]}
          defaultValue="full_time"
          {...register('employmentType')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="white" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="green" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
