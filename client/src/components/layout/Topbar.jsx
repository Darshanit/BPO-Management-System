import { useState, useEffect } from 'react';
import { MdNotifications, MdLogout } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services';
import { ROLE_LABELS } from '../../utils/roles';
import toast from 'react-hot-toast';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    notificationService
      .getMine({ unread: true })
      .then(({ data }) => {
        if (mounted) setUnreadCount(data.meta?.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b-brutal border-black bg-white px-6 py-4">
      <div>
        <p className="font-display font-bold text-lg">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        <p className="text-xs font-semibold text-black/50">{ROLE_LABELS[user?.role]}</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative border-brutal border-black rounded-brutal-sm p-2 bg-brutal-blue text-white hover:-translate-y-0.5 transition-transform"
        >
          <MdNotifications size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-brutal-pink text-white text-xs font-bold border-2 border-black rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-10 h-10 rounded-full border-brutal border-black bg-brutal-yellow flex items-center justify-center font-display font-bold">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>

        <button
          onClick={handleLogout}
          className="border-brutal border-black rounded-brutal-sm p-2 hover:bg-brutal-pink hover:text-white transition-colors"
          aria-label="Log out"
          title="Log out"
        >
          <MdLogout size={20} />
        </button>
      </div>
    </header>
  );
}
