from datetime import datetime, timedelta, timezone
from typing import Annotated

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
    field_validator,
)

from .models import LeadStatus, utcnow


# ---------- Time handling ----------
# We store times as UTC. When sending times out, we add a "Z" at the end
# (like 2026-10-14T09:30:00Z) so the browser knows it is UTC and
# converts it to the user's local time correctly.

def _to_naive_utc(value: datetime) -> datetime:
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def _to_iso_z(value: datetime) -> str:
    return _to_naive_utc(value).isoformat() + "Z"


UTCDateTime = Annotated[
    datetime,
    AfterValidator(_to_naive_utc),
    PlainSerializer(_to_iso_z, return_type=str),
]


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None


# ---------- Input (what the frontend sends) ----------

class LeadCreate(BaseModel):
    name: str = Field(max_length=120)
    company: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)

    @field_validator("name")
    @classmethod
    def name_is_required(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("company", "phone")
    @classmethod
    def blank_means_empty(cls, v: str | None) -> str | None:
        return _blank_to_none(v)


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class DiscussionCreate(BaseModel):
    note: str = Field(max_length=2000)
    follow_up_at: UTCDateTime | None = None

    @field_validator("note")
    @classmethod
    def note_is_required(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Note cannot be empty")
        return v

    @field_validator("follow_up_at")
    @classmethod
    def follow_up_not_in_past(cls, v: datetime | None) -> datetime | None:
        # 1 minute of grace so a "right now" follow-up is not rejected
        if v is not None and v < utcnow() - timedelta(minutes=1):
            raise ValueError("Follow-up must be in the future")
        return v


# ---------- Output (what the API sends back) ----------

class DiscussionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    note: str
    follow_up_at: UTCDateTime | None
    created_at: UTCDateTime


class LeadOut(BaseModel):
    """One row of the lead list."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    company: str | None
    phone: str | None
    status: LeadStatus
    follow_up_at: UTCDateTime | None
    created_at: UTCDateTime
    last_note: str | None
    last_note_at: UTCDateTime | None


class LeadDetail(LeadOut):
    """A lead plus its full discussion history (newest first)."""
    discussions: list[DiscussionOut]