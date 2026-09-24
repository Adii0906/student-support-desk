export type Category = 'Fees' | 'Attendance' | 'ID Card' | 'Documents' | 'Certificates' | 'Other';
export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Escalated';

export const CATEGORIES: Category[] = ['Fees', 'Attendance', 'ID Card', 'Documents', 'Certificates', 'Other'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const STATUSES: Status[] = ['Open', 'In Progress', 'Resolved', 'Escalated'];

// Mirrors backend/logic.py. The backend is the source of truth; these are only for display hints.
export const SLA_HOURS: Record<Priority, number> = { High: 4, Medium: 24, Low: 72 };
export const CATEGORY_PRIORITY: Record<Category, Priority> = {
  Fees: 'High',
  Attendance: 'Medium',
  'ID Card': 'Low',
  Documents: 'Medium',
  Certificates: 'Medium',
  Other: 'Low',
};

export interface Ticket {
  id: number;
  student_name: string;
  roll_number: string;
  category: Category;
  subject: string;
  description: string;
  priority: Priority;
  status: Status;
  assigned_to: string;
  created_at: string;
  sla_deadline: string;
  resolved_at: string | null;
  breached: boolean;
}

export interface Activity {
  id: number;
  ticket_id: number;
  timestamp: string;
  action: string;
  actor: string;
}

export interface TicketDetailData extends Ticket {
  activity: Activity[];
}

export interface Staff {
  id: string;
  name: string;
  section: string;
  categories: Category[];
}

export interface TicketFilters {
  status: Status | '';
  category: Category | '';
  breached: boolean;
  query: string; // client-side search, not sent to the API
}

export interface NewTicket {
  student_name: string;
  roll_number: string;
  category: Category;
  subject: string;
  description: string;
}

export interface TicketPatch {
  status?: Status;
  assigned_to?: string;
  priority?: Priority;
  actor: string;
}
