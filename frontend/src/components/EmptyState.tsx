import { Link } from 'react-router-dom';

export function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="animate-rise-in border-b border-rule px-4 py-14 text-center sm:px-8">
      {filtered ? (
        <>
          <h3 className="text-heading font-semibold">No tickets match these filters</h3>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">
            Try a different status, category or search, or clear the filters to see the whole register.
          </p>
          <button type="button" onClick={onClear} className="btn-secondary mt-5">
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-heading font-semibold">The register is empty</h3>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">
            No tickets have been raised yet. New requests from students will appear here as they come in.
          </p>
          <Link to="/raise" className="btn-secondary mt-5">
            Raise a test ticket
          </Link>
        </>
      )}
    </div>
  );
}
