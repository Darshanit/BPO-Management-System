import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async ({ name, email, password }) => {
    setIsSubmitting(true);
    try {
      await authService.register({ name, email, password });
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join the BPO Manager platform">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters, 1 number"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
            pattern: { value: /\d/, message: 'Must contain at least one number' },
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

        <Button type="submit" variant="green" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm font-semibold">
        Already have an account?{' '}
        <Link to="/login" className="underline hover:text-brutal-pink">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
