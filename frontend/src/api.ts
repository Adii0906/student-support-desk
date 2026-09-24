import type { NewTicket, Staff, Ticket, TicketDetailData, TicketFilters, TicketPatch } from './types';

// Empty by default: requests go to /api on the same origin and Vite proxies them to FastAPI.
// Set VITE_API_URL (e.g. http://127.0.0.1:8000) only if you serve the frontend without Vite.
export const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const OFFLINE_MESSAGE =
  'Cannot reach the ticket server. Make sure the backend is running (python run.py in the backend folder).';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(OFFLINE_MESSAGE, 0);
  }
  // The Vite proxy answers 502/503/504 when FastAPI is down.
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    throw new ApiError(OFFLINE_MESSAGE, res.status);
  }
  if (!res.ok) {
    let message = `Request failed with status ${res.status}.`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) message = 'Some fields are not valid. Check them and try again.';
    } catch {
      if (res.status >= 500) message = OFFLINE_MESSAGE;
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health(): Promise<{ ok: boolean }> {
    return request('/api/health');
  },
  listTickets(filters: Partial<TicketFilters> = {}): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.breached) params.set('breached', 'true');
    const qs = params.toString();
    return request<Ticket[]>(`/api/tickets${qs ? `?${qs}` : ''}`);
  },
  getTicket(id: number): Promise<TicketDetailData> {
    return request<TicketDetailData>(`/api/tickets/${id}`);
  },
  createTicket(body: NewTicket): Promise<Ticket> {
    return request<Ticket>('/api/tickets', { method: 'POST', body: JSON.stringify(body) });
  },
  updateTicket(id: number, body: TicketPatch): Promise<TicketDetailData> {
    return request<TicketDetailData>(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  listStaff(): Promise<Staff[]> {
    return request<Staff[]>('/api/staff');
  },
};
