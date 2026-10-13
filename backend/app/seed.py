"""
Fills the database with sample leads and discussions.

Run from the backend folder:
    python -m app.seed            (only adds data if the database is empty)
    python -m app.seed --reset    (deletes everything, then adds fresh data)

Times are relative to "now", so there is always a lead with a follow-up
today, one that is overdue, and one coming up later.
"""
import sys
from datetime import timedelta

from .database import Base, SessionLocal, engine
from .models import Discussion, Lead, LeadStatus, utcnow


def add_lead(db, name, company, phone, status, notes):
    """
    notes is a list of (time_ago, text, follow_up_in) tuples.
    - time_ago: a timedelta, how long ago the note was written
    - follow_up_in: a timedelta from now (negative = in the past), or None
    """
    now = utcnow()
    lead = Lead(
        name=name,
        company=company,
        phone=phone,
        status=status,
        created_at=now - max(n[0] for n in notes),
    )

    latest_time = None
    for time_ago, text, follow_up_in in notes:
        created_at = now - time_ago
        follow_up_at = now + follow_up_in if follow_up_in is not None else None
        lead.discussions.append(
            Discussion(note=text, created_at=created_at, follow_up_at=follow_up_at)
        )
        # The lead keeps the follow-up from its most recent note
        if latest_time is None or created_at > latest_time:
            latest_time = created_at
            lead.follow_up_at = follow_up_at

    db.add(lead)


def run(reset=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if reset:
            db.query(Discussion).delete()
            db.query(Lead).delete()
            db.commit()
            print("Old data deleted.")
        elif db.query(Lead).count() > 0:
            print("Database already has leads. Use --reset to start fresh.")
            return

        days = lambda n: timedelta(days=n)
        hours = lambda n: timedelta(hours=n)

        # 1. Follow-up due today (it will show in the pinned section)
        add_lead(db, "Sarah Connor", "Acme Corp", "555-0199", LeadStatus.PROPOSAL_SENT, [
            (days(6), "Lead created via web form.", None),
            (days(5), "Initial discovery call. They need a CRM for 50 reps. "
                      "Pain points include dropping leads and no follow-up tracking.", None),
            (days(2), "Sent pricing tier PDF. Said she would review with her boss.", hours(1)),
        ])

        # 2. Brand new lead
        add_lead(db, "Hank Scorpio", "Globex", "555-0142", LeadStatus.NEW, [
            (hours(2), "Inbound lead from website contact form.", None),
        ])

        # 3. Overdue follow-up (it will show in red)
        add_lead(db, "Bill Lumbergh", "Initech", "555-0173", LeadStatus.CONTACTED, [
            (days(9), "Lead created via referral.", None),
            (days(7), "Left a voicemail with his assistant.", -days(2)),
        ])

        # 4. Won
        add_lead(db, "Bruce Wayne", "Wayne Ent", "555-0100", LeadStatus.WON, [
            (days(30), "Lead created via conference booth scan.", None),
            (days(24), "Demo went great. Asked for a contract.", None),
            (days(21), "Contract signed! Sending welcome package.", None),
        ])

        # 5. Qualified, follow-up coming up tomorrow
        add_lead(db, "Tony Stark", "Stark Industries", "555-0188", LeadStatus.QUALIFIED, [
            (days(4), "Lead created via LinkedIn outreach.", None),
            (days(1), "Budget confirmed. Wants a custom integration demo.", days(1)),
        ])

        # 6. Lost
        add_lead(db, "Peter Parker", "Daily Bugle", None, LeadStatus.LOST, [
            (days(20), "Lead created via web form.", None),
            (days(14), "Went with a cheaper competitor. Will check back next year.", None),
        ])

        # 7. Contacted, follow-up later this week
        add_lead(db, "Diana Prince", "Themyscira Exports", "555-0155", LeadStatus.CONTACTED, [
            (days(3), "Lead created via referral from Bruce Wayne.", None),
            (hours(5), "Intro call done. Wants a quote for 20 users.", days(3)),
        ])

        db.commit()
        print(f"Done. Added {db.query(Lead).count()} leads and "
              f"{db.query(Discussion).count()} discussions.")
    finally:
        db.close()


if __name__ == "__main__":
    run(reset="--reset" in sys.argv)