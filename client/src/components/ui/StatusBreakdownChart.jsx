import '../../utils/chartSetup';
import { Doughnut } from 'react-chartjs-2';
import Card from './Card';

const BRUTAL_COLORS = ['#FFE34F', '#4D8BFF', '#FF5FA2', '#78E08F', '#FFB84C'];

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  planning: 'Planning',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

/** `data` shape: [{ _id: 'todo', count: 5 }, ...] as returned by the aggregate endpoints. */
export default function StatusBreakdownChart({ title, data = [] }) {
  const chartData = {
    labels: data.map((d) => STATUS_LABELS[d._id] || d._id),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: BRUTAL_COLORS,
        borderColor: '#000000',
        borderWidth: 3,
      },
    ],
  };

  return (
    <Card>
      <h3 className="font-display font-bold text-lg mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-black/50 text-center py-8">No data yet</p>
      ) : (
        <div className="max-w-[240px] mx-auto">
          <Doughnut
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { font: { family: '"Space Grotesk"', weight: 'bold' }, boxWidth: 12 },
                },
              },
            }}
          />
        </div>
      )}
    </Card>
  );
}
