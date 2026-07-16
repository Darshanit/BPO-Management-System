import { useQuery } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { projectService } from '../../services';

export default function ClientProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-client-projects'],
    queryFn: () => projectService.getMyClientProjects().then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">My Projects</h1>

      {!projects?.length ? (
        <Card className="text-center py-16">
          <p className="font-display font-bold">No projects assigned yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project._id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-bold text-lg">{project.name}</h3>
                <Badge status={project.status}>{project.status}</Badge>
              </div>
              <p className="text-black/60 text-sm mb-4">{project.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-4 border-brutal border-black rounded-full overflow-hidden bg-white">
                  <div
                    className="h-full bg-brutal-green"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-black/60">
                <span>Team Leader: {project.teamLeader?.employeeId || '—'}</span>
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>

              {project.milestones?.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-black/10">
                  <p className="text-xs font-bold uppercase text-black/50 mb-2">Milestones</p>
                  <ul className="space-y-1">
                    {project.milestones.map((m) => (
                      <li key={m._id} className="flex items-center gap-2 text-sm">
                        <span className={`w-3 h-3 rounded-full border-2 border-black ${m.isCompleted ? 'bg-brutal-green' : 'bg-white'}`} />
                        {m.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
