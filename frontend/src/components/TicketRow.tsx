import { useEffect, useState } from 'react';
import { elapsed, ticketRef } from '../lib/format';
import type { Staff, Ticket, TicketDetailData } from '../types';
import { SlaBadge } from './SlaBadge';
import { StatusDot } from './StatusDot';
import { TicketDetail } from './TicketDetail';

// Shared with the header row in Dashboard so columns line up.
export const ROW_GRID =
  'lg:grid lg:grid-cols-[6rem_minmax(0,1fr)_6.5rem_4.75rem_7.5rem_7.5rem_5rem_7.5rem] lg:gap-x-4 lg:items-center';

interface Props {
  ticket: Ticket;
  now: number;
  expanded: boolean;
  flashKey: number;
  onToggle: () => void;
  staff: Staff[];
  actor: string;
  onUpdated: (t: TicketDetailData, message: string) => void;
  onError: (message: string) => void;
}

const PRIORITY_TEXT = { High: 'font-semibold text-ink', Medium: 'text-ink', Low: 'text-ink-muted' } as const;

export function TicketRow({ ticket, now, expanded, flashKey, onToggle, staff, actor, onUpdated, onError }: Props) {
  // Keep the detail mounted while it collapses so the transition has content to animate.
  const [mounted, setMounted] = useState(expanded);
  useEffect(() => {
    if (expanded) setMounted(true);
  }, [expanded]);

  const panelId = `ticket-panel-${ticket.id}`;
  const ref = ticketRef(ticket.id);

  return (
    <div
      className={`relative border-b border-l-[3px] border-b-rule transition-colors ${
        expanded ? 'border-l-ink bg-paper-sheet' : 'border-l-transparent'
      }`}
    >
      {flashKey > 0 && (
        <span key={flashKey} aria-hidden className="pointer-events-none absolute inset-0 animate-row-flash" />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        title={expanded ? 'Close details' : 'Open details'}
        className={`relative w-full px-4 py-3.5 text-left text-body hover:bg-paper-sunk/60 focus-visible:outline-offset-[-2px] ${ROW_GRID}`}
      >
        {/* Desktop cells */}
        <span className="hidden font-medium tabular-nums lg:flex lg:items-center lg:gap-1.5">
          <svg
            aria-hidden
            viewBox="0 0 10 10"
            className={`h-2.5 w-2.5 shrink-0 text-ink-faint transition-transform duration-300 ease-drawer ${expanded ? 'rotate-90' : ''}`}
          >
            <path d="M3 1.5 L7 5 L3 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {ref}
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block truncate font-medium">{ticket.subject}</span>
          <span className="block truncate text-meta text-ink-muted">
            {ticket.student_name}, {ticket.roll_number}
          </span>
        </span>
        <span className="hidden lg:block">{ticket.category}</span>
        <span className={`hidden lg:block ${PRIORITY_TEXT[ticket.priority]}`}>{ticket.priority}</span>
        <span className="hidden lg:block"><StatusDot status={ticket.status} /></span>
        <span className="hidden truncate lg:block">{ticket.assigned_to}</span>
        <span className="hidden tabular-nums text-ink-muted lg:block">{elapsed(ticket, now)}</span>
        <span className="hidden lg:block"><SlaBadge ticket={ticket} now={now} /></span>

        {/* Mobile layout */}
        <span className="flex flex-col gap-2 lg:hidden">
          <span className="flex items-start justify-between gap-4">
            <span className="min-w-0">
              <span className="block text-meta tabular-nums text-ink-muted">
                {ref}, {ticket.category}
              </span>
              <span className="mt-0.5 block font-medium">{ticket.subject}</span>
            </span>
            <SlaBadge ticket={ticket} now={now} />
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-1 text-meta text-ink-soft">
            <StatusDot status={ticket.status} />
            <span className={PRIORITY_TEXT[ticket.priority]}>{ticket.priority} priority</span>
            <span>{ticket.assigned_to}</span>
            <span className="text-ink-muted">
              {ticket.resolved_at ? `closed in ${elapsed(ticket, now)}` : `${elapsed(ticket, now)} open`}
            </span>
          </span>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`Details for ${ref}`}
        className={`relative grid transition-[grid-template-rows] duration-300 ease-drawer ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && !expanded) setMounted(false);
        }}
      >
        <div className="overflow-hidden">
          {mounted && (
            <div className="border-t border-dashed border-rule">
              <TicketDetail
                ticketId={ticket.id}
                staff={staff}
                actor={actor}
                onUpdated={onUpdated}
                onError={onError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
