import type { Ticket } from '../types';
import { slaState, type SlaState } from '../lib/format';

const LABEL: Record<SlaState, string> = {
  'on-track': 'On track',
  'due-soon': 'Due soon',
  breached: 'Breached',
  met: 'Met',
  late: 'Resolved late',
};

const EDGE: Record<SlaState, string> = {
  'on-track': 'border-state-open text-ink',
  'due-soon': 'border-state-progress text-state-progress',
  breached: 'border-state-breached bg-state-breached/[0.07] text-state-breached',
  met: 'border-state-resolved text-state-resolved',
  late: 'border-rule-strong text-ink-muted',
};

export function SlaBadge({ ticket, now }: { ticket: Ticket; now: number }) {
  const { state, detail } = slaState(ticket, now);
  return (
    <span className={`inline-flex shrink-0 flex-col whitespace-nowrap border-l-[3px] py-0.5 pl-2 pr-1.5 leading-tight ${EDGE[state]}`}>
      <span className="text-meta font-semibold">{LABEL[state]}</span>
      <span className="text-[0.75rem] text-ink-muted">{detail}</span>
    </span>
  );
}
