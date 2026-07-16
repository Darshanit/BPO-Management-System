const STATUS_COLORS = {
  // Generic
  active: 'bg-brutal-green',
  inactive: 'bg-black/10',
  // Attendance / leave / task / project statuses
  present: 'bg-brutal-green',
  absent: 'bg-brutal-pink',
  pending: 'bg-brutal-yellow',
  approved: 'bg-brutal-green',
  rejected: 'bg-brutal-pink',
  cancelled: 'bg-black/10',
  todo: 'bg-black/10',
  in_progress: 'bg-brutal-blue text-white',
  review: 'bg-brutal-orange',
  completed: 'bg-brutal-green',
  planning: 'bg-black/10',
  on_hold: 'bg-brutal-orange',
  // Invoices / tickets
  unpaid: 'bg-brutal-orange',
  paid: 'bg-brutal-green',
  overdue: 'bg-brutal-pink text-white',
  open: 'bg-brutal-yellow',
  closed: 'bg-black/10',
  resolved: 'bg-brutal-green',
  urgent: 'bg-brutal-pink text-white',
  // Priority
  low: 'bg-black/10',
  medium: 'bg-brutal-yellow',
  high: 'bg-brutal-orange',
  critical: 'bg-brutal-pink text-white',
};

/** Renders a status/priority word with a color mapped from STATUS_COLORS, falling back to yellow. */
export default function Badge({ children, status }) {
  const key = String(status ?? children).toLowerCase().replace(/\s+/g, '_');
  const color = STATUS_COLORS[key] || 'bg-brutal-yellow';

  return <span className={`badge-brutal ${color}`}>{children}</span>;
}
