import { CATEGORIES, STATUSES, type Category, type Status, type TicketFilters } from '../types';

export const EMPTY_FILTERS: TicketFilters = { status: '', category: '', breached: false, query: '' };

export function isFiltered(f: TicketFilters) {
  return f.status !== '' || f.category !== '' || f.breached || f.query.trim() !== '';
}

export interface FilterCounts {
  all: number;
  byStatus: Record<Status, number>;
  breached: number;
}

interface Props {
  value: TicketFilters;
  counts: FilterCounts | null;
  onChange: (next: TicketFilters) => void;
  onClear: () => void;
}

export function Filters({ value, counts, onChange, onClear }: Props) {
  const tabs: { label: string; value: Status | ''; count?: number }[] = [
    { label: 'All', value: '', count: counts?.all },
    ...STATUSES.map((s) => ({ label: s, value: s, count: counts?.byStatus[s] })),
  ];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-rule" aria-label="Filter by status">
        {tabs.map((t) => {
          const active = value.status === t.value;
          return (
            <button
              key={t.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...value, status: t.value })}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-body transition-colors ${
                active ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-1.5 text-meta tabular-nums ${active ? 'text-ink-muted' : 'text-ink-faint'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-3" role="search">
        <label className="w-full sm:w-72">
          <span className="field-label">Search</span>
          <input
            type="search"
            className="field-input h-[38px] py-1.5"
            placeholder="Name, roll number, subject or ref"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
          />
        </label>
        <label className="min-w-[10rem]">
          <span className="field-label">Category</span>
          <select
            className="field-input h-[38px] py-1.5"
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value as Category | '' })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-pressed={value.breached}
          onClick={() => onChange({ ...value, breached: !value.breached })}
          className={`inline-flex h-[38px] items-center gap-2 rounded-form border px-3 text-body transition-colors ${
            value.breached
              ? 'border-state-breached bg-state-breached text-paper'
              : 'border-rule-strong bg-paper-sheet text-state-breached hover:border-state-breached'
          }`}
        >
          Past SLA only
          {counts && <span className="text-meta tabular-nums opacity-80">{counts.breached}</span>}
        </button>
        {isFiltered(value) && (
          <button type="button" onClick={onClear} className="btn-quiet mb-2.5">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
