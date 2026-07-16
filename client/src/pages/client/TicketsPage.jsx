import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import ClientTickets from './ClientTickets';
import TicketsAdmin from './TicketsAdmin';

export default function TicketsPage() {
  const { user } = useAuth();
  if (user?.role === ROLES.CLIENT) return <ClientTickets />;
  return <TicketsAdmin />;
}
