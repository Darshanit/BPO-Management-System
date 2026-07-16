import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async ({ email, password }) => {
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your BPO Manager account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold underline hover:text-brutal-pink">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="yellow" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
    </AuthLayout>
  );
}
