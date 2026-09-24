import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';
import { ActingAs } from '../components/ActingAs';
import { EmptyState } from '../components/EmptyState';
import { EMPTY_FILTERS, Filters, isFiltered, type FilterCounts } from '../components/Filters';
import { SkeletonRow } from '../components/SkeletonRow';
import { ROW_GRID, TicketRow } from '../components/TicketRow';
import { Toast, type ToastMessage } from '../components/Toast';
import { ticketRef } from '../lib/format';
import { useServerStatus } from '../lib/server';
import { STATUSES, type Staff, type Status, type Ticket, type TicketDetailData, type TicketFilters } from '../types';

export default function Dashboard() {
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_FILTERS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[] | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [actor, setActor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [flash, setFlash] = useState<{ id: number; n: number }>({ id: 0, n: 0 });
  const { online } = useServerStatus();

  // Re-render elapsed time and SLA badges every 30 seconds.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Close the open row with Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpandedId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadStaff = useCallback(() => {
    api
      .listStaff()
      .then((s) => {
        setStaff(s);
        setActor((a) => a || s[0]?.name || '');
      })
      .catch(() => {});
  }, []);

  const { status, category, breached } = filters;
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.listTickets({ status, category, breached }), api.listTickets()])
      .then(([list, all]) => {
        setTickets(list);
        setAllTickets(all);
        setNow(Date.now());
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, category, breached]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // When the backend comes back online after being down, reload automatically.
  const prevOnline = useRef(online);
  useEffect(() => {
    if (prevOnline.current === false && online === true) {
      load();
      loadStaff();
    }
    prevOnline.current = online;
  }, [online, load, loadStaff]);

  const handleUpdated = useCallback((updated: TicketDetailData, message: string) => {
    const { activity: _activity, ...row } = updated;
    void _activity;
    const replace = (list: Ticket[]) => list.map((t) => (t.id === row.id ? row : t));
    setTickets(replace);
    setAllTickets((list) => (list ? replace(list) : list));
    setFlash((f) => ({ id: row.id, n: f.n + 1 }));
    setToast({ id: Date.now(), text: message, kind: 'ok' });
  }, []);

  const handleError = useCallback((message: string) => {
    setToast({ id: Date.now(), text: message, kind: 'error' });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const counts: FilterCounts | null = useMemo(() => {
    if (!allTickets) return null;
    const base = category ? allTickets.filter((t) => t.category === category) : allTickets;
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
    base.forEach((t) => (byStatus[t.status] += 1));
    return { all: base.length, byStatus, breached: base.filter((t) => t.breached).length };
  }, [allTickets, category]);

  const q = filters.query.trim().toLowerCase();
  const visible = q
    ? tickets.filter((t) =>
        [ticketRef(t.id), t.subject, t.student_name, t.roll_number].some((s) => s.toLowerCase().includes(q)),
      )
    : tickets;

  const totalBreached = allTickets?.filter((t) => t.breached).length ?? 0;
  const totalOpen = allTickets?.filter((t) => t.status !== 'Resolved').length ?? 0;

  function changeFilters(next: TicketFilters) {
    const onlyQueryChanged =
      next.status === filters.status && next.category === filters.category && next.breached === filters.breached;
    setFilters(next);
    if (!onlyQueryChanged) setExpandedId(null);
  }

  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title font-semibold">Ticket register</h1>
          <p className="mt-1 min-h-[1.5rem] text-ink-muted" aria-live="polite">
            {allTickets && (
              <>
                {totalOpen} open {totalOpen === 1 ? 'ticket' : 'tickets'}.{' '}
                {totalBreached > 0 ? (
                  <button
                    type="button"
                    onClick={() => changeFilters({ ...EMPTY_FILTERS, breached: true })}
                    className="font-medium text-state-breached underline decoration-state-breached/40 underline-offset-4 hover:decoration-state-breached"
                  >
                    {totalBreached} past {totalBreached === 1 ? 'its' : 'their'} SLA deadline
                  </button>
                ) : (
                  <span>Nothing past its SLA deadline.</span>
                )}
              </>
            )}
          </p>
        </div>
        <ActingAs staff={staff} value={actor} onChange={setActor} />
      </div>

      <div className="mt-6">
        <Filters value={filters} counts={counts} onChange={changeFilters} onClear={() => changeFilters(EMPTY_FILTERS)} />
      </div>

      <p className="mt-6 text-meta text-ink-muted">
        {!loading && !error && `Showing ${visible.length} of ${allTickets?.length ?? 0}. `}
        Click a row to open it. Press Esc to close.
      </p>

      <div className="mt-2 border-t-2 border-ink" aria-busy={loading}>
        <div
          className={`hidden border-b border-l-[3px] border-b-rule-strong border-l-transparent px-4 py-2 text-meta font-medium text-ink-muted ${ROW_GRID}`}
          aria-hidden
        >
          <span className="pl-4">Ref.</span>
          <span>Subject and student</span>
          <span>Category</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Assigned to</span>
          <span>Elapsed</span>
          <span>SLA</span>
        </div>

        {loading && Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)}

        {!loading && error && (
          <div className="animate-rise-in border-b border-rule px-4 py-12">
            <h2 className="text-heading font-semibold">The register could not be loaded</h2>
            <p className="mt-2 max-w-measure text-ink-muted">{error}</p>
            <button type="button" onClick={load} className="btn-secondary mt-5">Try again</button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <EmptyState filtered={isFiltered(filters)} onClear={() => changeFilters(EMPTY_FILTERS)} />
        )}

        {!loading && !error && (
          <ul>
            {visible.map((t) => (
              <li key={t.id}>
                <TicketRow
                  ticket={t}
                  now={now}
                  expanded={expandedId === t.id}
                  flashKey={flash.id === t.id ? flash.n : 0}
                  onToggle={() => setExpandedId((id) => (id === t.id ? null : t.id))}
                  staff={staff}
                  actor={actor}
                  onUpdated={handleUpdated}
                  onError={handleError}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
