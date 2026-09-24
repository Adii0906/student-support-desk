import { useEffect, useState } from 'react';
import { api } from '../api';
import { dateTime, ticketRef } from '../lib/format';
import {
  PRIORITIES, STATUSES, type Priority, type Staff, type Status, type TicketDetailData, type TicketPatch,
} from '../types';
import { Spinner } from './Spinner';

interface Props {
  ticketId: number;
  staff: Staff[];
  actor: string;
  onUpdated: (ticket: TicketDetailData, message: string) => void;
  onError: (message: string) => void;
}

// The most common next steps for each status, shown as one-click buttons.
const NEXT_STEPS: Record<Status, { label: string; to: Status; primary?: boolean }[]> = {
  Open: [
    { label: 'Start work', to: 'In Progress', primary: true },
    { label: 'Escalate', to: 'Escalated' },
  ],
  'In Progress': [
    { label: 'Mark resolved', to: 'Resolved', primary: true },
    { label: 'Escalate', to: 'Escalated' },
  ],
  Escalated: [
    { label: 'Mark resolved', to: 'Resolved', primary: true },
    { label: 'Back to in progress', to: 'In Progress' },
  ],
  Resolved: [{ label: 'Reopen', to: 'Open' }],
};

export function TicketDetail({ ticketId, staff, actor, onUpdated, onError }: Props) {
  const [detail, setDetail] = useState<TicketDetailData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    api
      .getTicket(ticketId)
      .then((d) => !cancelled && setDetail(d))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  async function apply(patch: Omit<TicketPatch, 'actor'>, message: string, key: string) {
    if (!actor) {
      onError('Choose who you are acting as before making changes.');
      return;
    }
    setSaving(key);
    try {
      const updated = await api.updateTicket(ticketId, { ...patch, actor });
      setDetail(updated);
      onUpdated(updated, message);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  if (loadError) {
    return <p className="px-4 py-6 text-state-breached sm:px-6">{loadError}</p>;
  }

  if (!detail) {
    return (
      <div className="space-y-3 px-4 py-6 sm:px-6" aria-busy="true">
        <div className="h-4 w-2/5 animate-pulse rounded-sm bg-paper-sunk" />
        <div className="h-3 w-4/5 animate-pulse rounded-sm bg-paper-sunk" />
        <div className="h-3 w-3/5 animate-pulse rounded-sm bg-paper-sunk" />
      </div>
    );
  }

  const ref = ticketRef(detail.id);
  const busy = saving !== null;

  return (
    <div className="grid gap-8 px-4 pb-7 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0">
        <h3 className="text-heading font-semibold">{detail.subject}</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-meta sm:grid-cols-4">
          <div>
            <dt className="text-ink-muted">Student</dt>
            <dd className="font-medium">{detail.student_name}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Roll number</dt>
            <dd className="font-medium tabular-nums">{detail.roll_number}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Raised</dt>
            <dd className="font-medium">{dateTime(detail.created_at)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Respond by</dt>
            <dd className={`font-medium ${detail.breached ? 'text-state-breached' : ''}`}>
              {dateTime(detail.sla_deadline)}
            </dd>
          </div>
        </dl>

        <p className="mt-5 max-w-measure whitespace-pre-line font-serif text-[1.0625rem] leading-[1.7] text-ink">
          {detail.description}
        </p>

        <h4 className="mt-8 text-heading font-semibold">Activity</h4>
        <ol className="mt-3 border-l border-rule-strong">
          {detail.activity.map((a) => (
            <li key={a.id} className="relative animate-rise-in pb-3 pl-5 last:pb-0">
              <span aria-hidden className="absolute -left-[4px] top-[0.55rem] h-[7px] w-[7px] rounded-full bg-ink-faint" />
              <div className="flex flex-col gap-x-4 sm:flex-row">
                <time dateTime={a.timestamp} className="shrink-0 text-meta tabular-nums text-ink-muted sm:w-32">
                  {dateTime(a.timestamp)}
                </time>
                <p className="text-body">
                  {a.action}
                  <span className="text-ink-muted"> by {a.actor}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside className="h-fit border border-rule bg-paper p-4" aria-label={`Update ${ref}`}>
        <h4 className="text-heading font-semibold">Update ticket</h4>

        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT_STEPS[detail.status].map((step) => (
            <button
              key={step.label}
              type="button"
              disabled={busy}
              onClick={() => apply({ status: step.to }, `${ref} moved to ${step.to}.`, step.label)}
              className={step.primary ? 'btn-primary px-3 py-2' : 'btn-secondary px-3 py-2'}
            >
              {saving === step.label && <Spinner className="h-3.5 w-3.5" />}
              {step.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4 border-t border-rule pt-4">
          <label className="block">
            <span className="field-label">Assigned to</span>
            <select
              className="field-input"
              value={detail.assigned_to}
              disabled={busy}
              onChange={(e) => apply({ assigned_to: e.target.value }, `${ref} reassigned to ${e.target.value}.`, 'assign')}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}, {s.section}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Priority</span>
            <select
              className="field-input"
              value={detail.priority}
              disabled={busy}
              onChange={(e) =>
                apply(
                  { priority: e.target.value as Priority },
                  `${ref} priority set to ${e.target.value}. SLA deadline updated.`,
                  'priority',
                )
              }
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Status</span>
            <select
              className="field-input"
              value={detail.status}
              disabled={busy}
              onChange={(e) => apply({ status: e.target.value as Status }, `${ref} moved to ${e.target.value}.`, 'status')}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-meta text-ink-muted" aria-live="polite">
          {busy ? 'Saving…' : `Changes save immediately and are logged as ${actor || 'the selected staff member'}.`}
        </p>
      </aside>
    </div>
  );
}
