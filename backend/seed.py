"""Demo data so the register is not empty on first run. Runs only when the DB has no tickets."""
from datetime import timedelta

from sqlalchemy import func, select

from db import SessionLocal
from logic import CATEGORY_PRIORITY, CATEGORY_STAFF, STAFF_BY_NAME, compute_deadline, utcnow
from models import ActivityLog, Ticket

SEED = [
    ("Ananya Rao", "SCE23CS014", "Fees", "Second instalment paid but portal still shows due",
     "I paid the second fee instalment on the 18th through the college payment link. The amount was debited from my account but the student portal still shows it as pending and I have received a reminder SMS. Transaction reference is attached in my email to accounts.",
     6, []),
    ("Mohammed Irfan", "SCE24EC052", "Attendance", "Attendance for NSS camp days not updated",
     "I attended the NSS camp from 9th to 11th September with permission from the NSS coordinator. These three days are marked absent in my Digital Electronics and Maths attendance. The coordinator has the signed attendance sheet.",
     30, [(3, "status", "In Progress")]),
    ("Keerthana S", "SCE22IS031", "Certificates", "Bonafide certificate needed for education loan",
     "My bank needs a bonafide certificate mentioning the course duration and fee structure for the second disbursement of my education loan. I need it addressed to Canara Bank, Jayanagar branch.",
     5, []),
    ("Rahul Gowda", "SCE23ME007", "ID Card", "Lost ID card, need a duplicate",
     "I lost my ID card in the bus last week. I have filed a complaint at the college gate register. Please let me know the fee for a duplicate card and when I can collect it.",
     50, [(20, "status", "In Progress")]),
    ("Priya Nair", "SCE24CS088", "Fees", "Scholarship amount not adjusted in fee receipt",
     "My SSP scholarship was credited to the college account in August, but my latest fee receipt shows the full amount as payable. Please adjust the scholarship and issue a revised receipt.",
     2, []),
    ("Varun Hegde", "SCE22CV019", "Documents", "Original 12th marks card needed for passport",
     "I submitted my original 12th marks card at admission. I need it back temporarily for my passport appointment on the 28th. I can return it after the appointment.",
     20, [(2, "status", "In Progress"), (9, "status", "Resolved")]),
    ("Sneha Kulkarni", "SCE23AI040", "Attendance", "Medical leave not considered in shortage list",
     "I was hospitalised for five days in August and submitted the medical certificate to my class advisor. My name still appears on the attendance shortage list for Operating Systems. I submitted the certificate on 2nd September.",
     80, [(6, "status", "In Progress"), (30, "status", "Escalated")]),
    ("Arjun Shetty", "SCE24IS066", "Other", "Hostel and college fee receipts mixed up",
     "The receipt I received for college fees shows the hostel fee amount and vice versa. I need correct receipts for my father's reimbursement claim at his office.",
     10, []),
    ("Divya Menon", "SCE22EC025", "Certificates", "Status of provisional degree certificate",
     "I applied for the provisional degree certificate three weeks ago for a job offer that needs it before joining. Please let me know the status and expected date.",
     96, [(5, "status", "In Progress"), (40, "status", "Resolved")]),
    ("Karthik Reddy", "SCE23CS071", "Fees", "Exam fee paid twice, requesting refund",
     "The exam fee payment page timed out and I paid again. Both payments of 1,850 rupees went through. Please refund the duplicate payment to the same account.",
     26, [(1, "status", "In Progress"), (3, "status", "Resolved")]),
    ("Fathima Zahra", "SCE24ME012", "ID Card", "Name misspelt on new ID card",
     "My new ID card shows my name as Fatima Zahra. The correct spelling as per my SSLC certificate is Fathima Zahra. Please reissue the card.",
     1, []),
    ("Nikhil Joshi", "SCE23CS099", "Documents", "Transfer certificate copy for internship verification",
     "My internship company's background verification team needs an attested copy of my transfer certificate from school that is held by the college. Please share an attested photocopy.",
     14, [(2, "assign", "S. Prakash"), (4, "status", "In Progress")]),
]


def _log(db, ticket_id, ts, action, actor):
    db.add(ActivityLog(ticket_id=ticket_id, timestamp=ts, action=action, actor=actor))


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.scalar(select(func.count(Ticket.id))) > 0:
            return
        now = utcnow()
        for name, roll, cat, subject, desc, hours_ago, events in SEED:
            created = now - timedelta(hours=hours_ago)
            priority = CATEGORY_PRIORITY[cat]
            staff = CATEGORY_STAFF[cat]
            t = Ticket(
                student_name=name, roll_number=roll, category=cat, subject=subject,
                description=desc, priority=priority, status="Open", assigned_to=staff,
                created_at=created, sla_deadline=compute_deadline(created, priority),
            )
            db.add(t)
            db.flush()
            _log(db, t.id, created, "Ticket raised", name)
            _log(db, t.id, created,
                 f"Auto-assigned to {staff} ({STAFF_BY_NAME[staff]['section']}) with {priority} priority", "System")
            for after, kind, value in events:
                ts = created + timedelta(hours=after)
                if kind == "status":
                    _log(db, t.id, ts, f"Status changed from {t.status} to {value}", t.assigned_to)
                    t.status = value
                    if value == "Resolved":
                        t.resolved_at = ts
                elif kind == "assign":
                    _log(db, t.id, ts, f"Reassigned from {t.assigned_to} to {value}", t.assigned_to)
                    t.assigned_to = value
        db.commit()
    finally:
        db.close()
