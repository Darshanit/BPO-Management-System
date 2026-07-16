import Skeleton from './Skeleton';

/**
 * Generic Neo-Brutalism table.
 * columns: [{ key, label, render?: (row) => node }]
 */
export default function Table({ columns, data = [], isLoading = false, emptyMessage = 'No records found' }) {
  if (isLoading) {
    return (
      <div className="card-brutal space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-brutal text-center py-12">
        <p className="font-display font-bold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card-brutal overflow-x-auto p-0">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-brutal border-black bg-brutal-yellow/40">
            {columns.map((col) => (
              <th key={col.key} className="text-left font-display font-bold px-4 py-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row._id || row.id || idx} className="border-b-2 border-black/10 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
