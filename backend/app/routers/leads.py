from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Discussion, Lead, LeadStatus
from ..schemas import (
    DiscussionCreate,
    LeadCreate,
    LeadDetail,
    LeadOut,
    LeadStatusUpdate,
)

router = APIRouter(prefix="/leads", tags=["leads"])


def get_lead_or_404(db: Session, lead_id: int) -> Lead:
    lead = db.get(Lead, lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.get("", response_model=list[LeadOut])
def list_leads(
    status: LeadStatus | None = None,
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    """All leads. Optional ?status=Won and ?search=sarah (search by name)."""
    query = select(Lead).options(selectinload(Lead.discussions))

    if status is not None:
        query = query.where(Lead.status == status)
    if search and search.strip():
        query = query.where(Lead.name.ilike(f"%{search.strip()}%"))

    leads = db.scalars(query).all()
    # Most recently discussed leads first
    return sorted(leads, key=lambda l: l.last_note_at or l.created_at, reverse=True)


@router.post("", response_model=LeadOut, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    """Add a new lead. Status always starts as New."""
    lead = Lead(
        name=payload.name,
        company=payload.company,
        phone=payload.phone,
        status=LeadStatus.NEW,
    )
    # First entry in the timeline, so the list has a "last note" right away
    lead.discussions.append(Discussion(note="Lead created."))
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadDetail)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """One lead with its full discussion history, newest first."""
    return get_lead_or_404(db, lead_id)


@router.patch("/{lead_id}", response_model=LeadDetail)
def update_status(
    lead_id: int, payload: LeadStatusUpdate, db: Session = Depends(get_db)
):
    """Change the status of a lead."""
    lead = get_lead_or_404(db, lead_id)
    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return lead


@router.post("/{lead_id}/discussions", response_model=LeadDetail, status_code=201)
def add_discussion(
    lead_id: int, payload: DiscussionCreate, db: Session = Depends(get_db)
):
    """
    Add a note to a lead. If a follow-up date is given, the lead's
    follow-up is updated too, so the list changes straight away.
    """
    lead = get_lead_or_404(db, lead_id)
    lead.discussions.append(
        Discussion(note=payload.note, follow_up_at=payload.follow_up_at)
    )
    if payload.follow_up_at is not None:
        lead.follow_up_at = payload.follow_up_at
    db.commit()
    db.refresh(lead)
    return lead