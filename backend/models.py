from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_name: Mapped[str] = mapped_column(String(80))
    roll_number: Mapped[str] = mapped_column(String(20), index=True)
    category: Mapped[str] = mapped_column(String(20), index=True)
    subject: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20), index=True, default="Open")
    assigned_to: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    sla_deadline: Mapped[datetime] = mapped_column(DateTime)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    activity: Mapped[list["ActivityLog"]] = relationship(
        back_populates="ticket",
        order_by="ActivityLog.timestamp",
        cascade="all, delete-orphan",
    )


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    action: Mapped[str] = mapped_column(String(255))
    actor: Mapped[str] = mapped_column(String(80))

    ticket: Mapped[Ticket] = relationship(back_populates="activity")
