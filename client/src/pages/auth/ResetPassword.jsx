import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async ({ password }) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something you'll remember">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="password"
          label="New password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            validate: (val) => val === watch('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" variant="yellow" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
