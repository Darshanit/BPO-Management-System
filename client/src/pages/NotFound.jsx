import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brutal-pink p-4 text-center">
      <h1 className="font-display font-bold text-8xl mb-2">404</h1>
      <p className="font-display font-bold text-xl mb-6">This page wandered off the kanban board.</p>
      <Link to="/dashboard">
        <Button variant="white">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
