/**
 * Neo-Brutalism card container. Set `interactive` for the hover-lift
 * treatment used on clickable cards (list items, kanban cards, etc).
 */
export default function Card({ children, interactive = false, className = '', ...props }) {
  const base = interactive ? 'card-brutal-interactive' : 'card-brutal';
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  );
}
