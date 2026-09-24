from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer

Category = Literal["Fees", "Attendance", "ID Card", "Documents", "Certificates", "Other"]
Priority = Literal["Low", "Medium", "High"]
Status = Literal["Open", "In Progress", "Resolved", "Escalated"]


def _iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc).isoformat()


class TicketCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    student_name: str = Field(min_length=2, max_length=80)
    roll_number: str = Field(min_length=3, max_length=20)
    category: Category
    subject: str = Field(min_length=4, max_length=120)
    description: str = Field(min_length=10, max_length=4000)
    priority: Optional[Priority] = None


class TicketUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    status: Optional[Status] = None
    assigned_to: Optional[str] = None
    priority: Optional[Priority] = None
    actor: str = Field(min_length=1, max_length=80)


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    timestamp: datetime
    action: str
    actor: str

    @field_serializer("timestamp")
    def _ser_ts(self, v: datetime):
        return _iso(v)


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_name: str
    roll_number: str
    category: str
    subject: str
    description: str
    priority: str
    status: str
    assigned_to: str
    created_at: datetime
    sla_deadline: datetime
    resolved_at: Optional[datetime] = None
    breached: bool = False

    @field_serializer("created_at", "sla_deadline", "resolved_at")
    def _ser_dt(self, v: Optional[datetime]):
        return _iso(v)


class TicketDetailOut(TicketOut):
    activity: list[ActivityOut] = []


class StaffOut(BaseModel):
    id: str
    name: str
    section: str
    categories: list[str]
