import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

# Make sibling imports work even when started as `uvicorn backend.main:app` from the project root.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import Depends, FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from sqlalchemy import select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from db import Base, engine, get_db  # noqa: E402
from logic import (  # noqa: E402
    CATEGORY_PRIORITY, CATEGORY_STAFF, STAFF_BY_NAME, compute_deadline,
    is_breached, staff_with_categories, utcnow,
)
from models import ActivityLog, Ticket  # noqa: E402
from schemas import (  # noqa: E402
    Category, StaffOut, Status, TicketCreate, TicketDetailOut, TicketOut, TicketUpdate,
)
from seed import seed_if_empty  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(title="Student Support & Ticket Management API", lifespan=lifespan)

# The frontend normally goes through the Vite proxy (same origin, no CORS needed).
# This also allows direct calls from any local dev port, in case VITE_API_URL is set.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def to_out(t: Ticket) -> TicketOut:
    out = TicketOut.model_validate(t)
    out.breached = is_breached(t.status, t.sla_deadline)
    return out


def to_detail(t: Ticket) -> TicketDetailOut:
    out = TicketDetailOut.model_validate(t)
    out.breached = is_breached(t.status, t.sla_deadline)
    return out


def get_or_404(db: Session, ticket_id: int) -> Ticket:
    t = db.get(Ticket, ticket_id)
    if not t:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return t


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/tickets", response_model=TicketOut, status_code=201)
def create_ticket(body: TicketCreate, db: Session = Depends(get_db)):
    priority = body.priority or CATEGORY_PRIORITY[body.category]
    staff = CATEGORY_STAFF[body.category]
    created = utcnow()
    t = Ticket(
        student_name=body.student_name,
        roll_number=body.roll_number.upper(),
        category=body.category,
        subject=body.subject,
        description=body.description,
        priority=priority,
        status="Open",
        assigned_to=staff,
        created_at=created,
        sla_deadline=compute_deadline(created, priority),
    )
    db.add(t)
    db.flush()
    db.add_all([
        ActivityLog(ticket_id=t.id, timestamp=created, action="Ticket raised", actor=body.student_name),
        ActivityLog(
            ticket_id=t.id, timestamp=created,
            action=f"Auto-assigned to {staff} ({STAFF_BY_NAME[staff]['section']}) with {priority} priority",
            actor="System",
        ),
    ])
    db.commit()
    db.refresh(t)
    return to_out(t)


@app.get("/api/tickets", response_model=list[TicketOut])
def list_tickets(
    status: Optional[Status] = None,
    category: Optional[Category] = None,
    breached: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    q = select(Ticket).order_by(Ticket.created_at.desc())
    if status:
        q = q.where(Ticket.status == status)
    if category:
        q = q.where(Ticket.category == category)
    rows = [to_out(t) for t in db.scalars(q).all()]
    if breached is not None:
        rows = [r for r in rows if r.breached == breached]
    return rows


@app.get("/api/tickets/{ticket_id}", response_model=TicketDetailOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return to_detail(get_or_404(db, ticket_id))


@app.patch("/api/tickets/{ticket_id}", response_model=TicketDetailOut)
def update_ticket(ticket_id: int, body: TicketUpdate, db: Session = Depends(get_db)):
    t = get_or_404(db, ticket_id)
    now = utcnow()
    logs: list[str] = []

    if body.assigned_to is not None and body.assigned_to != t.assigned_to:
        if body.assigned_to not in STAFF_BY_NAME:
            raise HTTPException(status_code=422, detail=f"Unknown staff member: {body.assigned_to}")
        logs.append(f"Reassigned from {t.assigned_to} to {body.assigned_to}")
        t.assigned_to = body.assigned_to

    if body.priority is not None and body.priority != t.priority:
        logs.append(f"Priority changed from {t.priority} to {body.priority}, SLA deadline recalculated")
        t.priority = body.priority
        t.sla_deadline = compute_deadline(t.created_at, body.priority)

    if body.status is not None and body.status != t.status:
        logs.append(f"Status changed from {t.status} to {body.status}")
        t.status = body.status
        t.resolved_at = now if body.status == "Resolved" else None

    for action in logs:
        db.add(ActivityLog(ticket_id=t.id, timestamp=now, action=action, actor=body.actor))

    db.commit()
    db.refresh(t)
    return to_detail(t)


@app.get("/api/staff", response_model=list[StaffOut])
def list_staff():
    return staff_with_categories()
