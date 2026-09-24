# Student Support & Ticket Management System


https://github.com/user-attachments/assets/d4de4b9e-4a38-4086-ada8-b87efc2a4c13



This app lets students raise service tickets and lets staff track, assign, and update them in one dashboard.

## How it works
- Students submit a ticket with category, subject, and description.
- The app auto-assigns it to the correct department staff member.
- Staff can view the ticket register, update status, reassign work, and monitor SLA deadlines.
- The dashboard shows active tickets, escalations, and overdue items.

## Quick start

**Linux / macOS**
```bash
./start.sh
```

**Windows**
```bat
start.bat
```

Then open http://localhost:5173. The scripts create a Python virtual environment, install everything, start the API, and start the frontend.

## Manual start (two terminals)

**Terminal 1, backend** (Python 3.9+)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
The API runs at http://127.0.0.1:8000 (docs at `/docs`). On first start it creates `backend/sso_tickets.db` and seeds 12 demo tickets. Delete that file to reset the data.

**Terminal 2, frontend** (Node 18+)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Troubleshooting

**"The ticket server is not running" banner.** The backend is not up. Start it with `python run.py` inside `backend`. The frontend reconnects by itself within a few seconds.

**`pip install` fails with "externally-managed-environment"** (Arch, Omarchy, Debian 12+, Ubuntu 23.04+). Your system Python blocks global installs. Use the virtual environment steps above, or `./start.sh`.

**How the wiring works.** The browser only talks to Vite on port 5173. Vite forwards every `/api/...` request to FastAPI on `127.0.0.1:8000` (see `frontend/vite.config.ts`). The browser never makes a cross-origin call, so there are no CORS or `localhost` vs `127.0.0.1` problems, and it works even if Vite picks another port. CORS is still enabled on the API for any local port, in case you set `VITE_API_URL` and call it directly.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check used by the frontend |
| POST | `/api/tickets` | Create a ticket. Auto-assigns by category and sets the SLA deadline |
| GET | `/api/tickets` | List tickets. Query params: `status`, `category`, `breached=true` |
| GET | `/api/tickets/{id}` | Ticket plus activity log |
| PATCH | `/api/tickets/{id}` | Update `status`, `assigned_to`, `priority`. Needs `actor`. Every change is logged |
| GET | `/api/staff` | Staff list with the categories each person handles |

## Approach note

**Rules live in one place.** `backend/logic.py` holds the SLA hours (High 4, Medium 24, Low 72), the category to staff mapping, and the default priority per category. Breach status is computed at read time (`status != Resolved and now > sla_deadline`), so no background job is needed. The frontend recomputes remaining time every 30 seconds so badges stay live.

**Routing.** Fees and Other go to R. Lakshmi (Accounts Section), Attendance to S. Prakash (Academic Section), ID Card, Documents and Certificates to M. Farheen (Records Office).

**Priority.** Derived from category. Staff can override it, and the SLA deadline is recalculated from the original creation time so an override cannot reset the clock.

**Audit trail.** Creation, auto-assignment, status changes, reassignments and priority changes all write to `ActivityLog` with the acting staff member.

**Ease of use.** Status tabs with live counts, search by name, roll number, subject or reference, a one-click "past SLA" filter, and one-click next steps in each ticket (Start work, Mark resolved, Escalate, Reopen). Students pick a category from labelled options and see where the ticket will go and how fast before submitting.

**Design.** Modelled on a college office rather than a SaaS product: the landing page is a pinned circular on a noticeboard, the dashboard reads like a register with ruled rows, status is a small solid dot, and SLA is a flat edge-marked tab. Motion is limited to moments that answer an action: the row expanding in place, a stamp landing on the ticket receipt, a brief highlight on a row after it is updated, and a confirmation toast. All motion is disabled under reduced-motion settings. Design tokens live in `frontend/tailwind.config.js`.

## Scope cuts

- No auth or login. An "Acting as" dropdown stands in for the logged-in staff member.
- No email or SMS notifications. An SLA breach is a visual badge only.
- No round-robin or load balancing. Assignment is a flat category to staff mapping, with manual reassignment as the one override.
- No file attachments.
