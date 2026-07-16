import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../utils/roles';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">My Profile</h1>
      <Card className="max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full border-brutal border-black bg-brutal-yellow flex items-center justify-center font-display font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-xl">{user?.name}</p>
            <span className="badge-brutal bg-brutal-blue text-white">{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-bold uppercase text-black/50">Email</dt>
            <dd className="font-semibold">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-black/50">Phone</dt>
            <dd className="font-semibold">{user?.phone || '—'}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
