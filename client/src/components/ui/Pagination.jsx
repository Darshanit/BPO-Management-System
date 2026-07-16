import Button from './Button';

/** Simple prev/next + page-number pagination bar driven by APIFeatures-shaped meta. */
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages } = meta;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm font-semibold text-black/60">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="white" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button
          size="sm"
          variant="white"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
