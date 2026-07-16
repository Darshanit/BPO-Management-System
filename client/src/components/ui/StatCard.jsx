import Card from './Card';

const ACCENTS = {
  yellow: 'bg-brutal-yellow',
  blue: 'bg-brutal-blue',
  pink: 'bg-brutal-pink',
  green: 'bg-brutal-green',
  orange: 'bg-brutal-orange',
};

/** Dashboard statistic card: big number, label, and an accent-colored icon badge. */
export default function StatCard({ label, value, icon: Icon, accent = 'yellow', trend }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-black/60">{label}</p>
        <p className="mt-2 text-3xl font-display font-bold">{value}</p>
        {trend && <p className="mt-1 text-xs font-semibold text-black/50">{trend}</p>}
      </div>
      {Icon && (
        <div className={`${ACCENTS[accent]} border-brutal border-black rounded-brutal-sm p-3`}>
          <Icon size={22} className="text-black" />
        </div>
      )}
    </Card>
  );
}
