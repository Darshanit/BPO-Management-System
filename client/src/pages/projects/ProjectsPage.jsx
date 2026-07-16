import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/roles';
import ClientProjects from '../client/ClientProjects';
import PlaceholderPage from '../PlaceholderPage';

export default function ProjectsPage() {
  const { user } = useAuth();
  if (user?.role === ROLES.CLIENT) return <ClientProjects />;
  return <PlaceholderPage title="Projects" />;
}
