import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a reset link">
      {sent ? (
        <p className="font-semibold">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Button type="submit" variant="yellow" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm font-semibold">
        <Link to="/login" className="underline hover:text-brutal-pink">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
