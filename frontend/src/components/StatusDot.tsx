import type { Status } from '../types';

const DOT: Record<Status, string> = {
  Open: 'bg-state-open',
  'In Progress': 'bg-state-progress',
  Resolved: 'bg-state-resolved',
  Escalated: 'bg-state-escalated',
};

export function StatusDot({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />
      <span>{status}</span>
    </span>
  );
}
