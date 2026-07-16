/** Pulsing placeholder block used while data loads. */
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-black/10 rounded-brutal-sm ${className}`} />;
}
