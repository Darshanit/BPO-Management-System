import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutal-yellow">
        <p className="font-display font-bold text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
