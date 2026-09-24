import type { Ticket } from '../types';

export function ticketRef(id: number): string {
  return `SSO-${String(id).padStart(4, '0')}`;
}

export function duration(ms: number): string {
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const m = mins % 60;
    return m ? `${hours}h ${m}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  return h ? `${days}d ${h}h` : `${days}d`;
}

const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export function dateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

export function longDate(d: Date): string {
  return dateFmt.format(d);
}

export function elapsed(ticket: Ticket, now: number): string {
  const start = new Date(ticket.created_at).getTime();
  const end = ticket.resolved_at ? new Date(ticket.resolved_at).getTime() : now;
  return duration(end - start);
}

export type SlaState = 'on-track' | 'due-soon' | 'breached' | 'met' | 'late';

export function slaState(ticket: Ticket, now: number): { state: SlaState; detail: string } {
  const deadline = new Date(ticket.sla_deadline).getTime();
  if (ticket.status === 'Resolved' && ticket.resolved_at) {
    const resolved = new Date(ticket.resolved_at).getTime();
    return resolved <= deadline
      ? { state: 'met', detail: 'within SLA' }
      : { state: 'late', detail: `${duration(resolved - deadline)} late` };
  }
  if (now > deadline) return { state: 'breached', detail: `${duration(now - deadline)} over` };
  const left = deadline - now;
  if (left < 60 * 60 * 1000) return { state: 'due-soon', detail: `${duration(left)} left` };
  return { state: 'on-track', detail: `${duration(left)} left` };
}
