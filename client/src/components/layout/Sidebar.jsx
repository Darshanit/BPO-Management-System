import { NavLink } from 'react-router-dom';
import { getNavForRole } from '../../utils/navConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const items = getNavForRole(user?.role);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r-brutal border-black bg-white min-h-screen p-4">
      <div className="mb-8 px-2">
        <h1 className="font-display font-bold text-xl leading-tight">
          BPO<span className="text-brutal-pink">.</span>
          <br />
          Manager
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-brutal-sm border-brutal font-display font-semibold text-sm
               transition-all duration-150
               ${
                 isActive
                   ? 'bg-brutal-yellow border-black shadow-brutal-sm -translate-x-0.5 -translate-y-0.5'
                   : 'border-transparent hover:border-black hover:bg-brutal-yellow/30'
               }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
