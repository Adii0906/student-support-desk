"""Business rules: SLA, category routing, default priority.

All datetimes are stored as naive UTC and serialized with an explicit +00:00 offset.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

CATEGORIES = ["Fees", "Attendance", "ID Card", "Documents", "Certificates", "Other"]
PRIORITIES = ["Low", "Medium", "High"]
STATUSES = ["Open", "In Progress", "Resolved", "Escalated"]

SLA_HOURS = {"High": 4, "Medium": 24, "Low": 72}

STAFF = [
    {"id": "lakshmi", "name": "R. Lakshmi", "section": "Accounts Section"},
    {"id": "prakash", "name": "S. Prakash", "section": "Academic Section"},
    {"id": "farheen", "name": "M. Farheen", "section": "Records Office"},
]
STAFF_BY_NAME = {s["name"]: s for s in STAFF}

CATEGORY_STAFF = {
    "Fees": "R. Lakshmi",
    "Attendance": "S. Prakash",
    "ID Card": "M. Farheen",
    "Documents": "M. Farheen",
    "Certificates": "M. Farheen",
    "Other": "R. Lakshmi",
}

CATEGORY_PRIORITY = {
    "Fees": "High",
    "Attendance": "Medium",
    "ID Card": "Low",
    "Documents": "Medium",
    "Certificates": "Medium",
    "Other": "Low",
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def compute_deadline(created_at: datetime, priority: str) -> datetime:
    return created_at + timedelta(hours=SLA_HOURS[priority])


def is_breached(status: str, sla_deadline: datetime, now: Optional[datetime] = None) -> bool:
    now = now or utcnow()
    return status != "Resolved" and now > sla_deadline


def staff_with_categories() -> list[dict]:
    out = []
    for s in STAFF:
        cats = [c for c, n in CATEGORY_STAFF.items() if n == s["name"]]
        out.append({**s, "categories": cats})
    return out
