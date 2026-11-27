"""
KiranaFlow — Pydantic Schemas (Frozen API Contract)

These schemas define the EXACT shape of every request/response between
frontend and backend. The frontend renders what it's told — it never
parses or merges on its own.

Reviewer fix #4: ParseResponse always echoes the full `draft` so the
frontend never does its own state merging.
"""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# ── Catalogue / Candidate ────────────────────────────────────────────────────

class Candidate(BaseModel):
    """A candidate product for disambiguation (e.g. Aashirvaad 1kg vs 5kg)."""
    product_id: int
    product_name: str


# ── Pending Draft (echoed on EVERY response) ─────────────────────────────────

class PendingDraft(BaseModel):
    """
    Full state of the entry being built. Echoed in every ParseResponse
    so the frontend never merges locally.

    Fields are Optional because they get filled progressively through
    the conversation (slot-filling).
    """
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    received: Optional[int] = None
    damaged: Optional[int] = None
    usable: Optional[int] = None
    unit: Optional[str] = None
    awaiting_confirmation: bool = False
    was_corrected: bool = False
    idempotency_key: Optional[str] = None

    # Clarification tracking
    pending_question_kind: Optional[str] = None  # variant | teen_tens | damaged_qty | unknown_sku | noise
    candidates: Optional[List[Candidate]] = None  # for variant disambiguation
    teen_tens_options: Optional[List[int]] = None   # e.g. [14, 40]


# ── Completed Entry (ready for /confirm) ─────────────────────────────────────

class PendingEntry(BaseModel):
    """A fully resolved entry ready for confirmation."""
    product_id: int
    product_name: str
    received: int
    damaged: int = 0
    usable: int
    unit: str
    idempotency_key: str


# ── Parse Request ────────────────────────────────────────────────────────────

class ParseRequest(BaseModel):
    """
    Frontend sends this on every voice/text turn.
    - transcript: the raw spoken/typed text
    - draft: the current pending draft state (empty {} on first turn)
    - lang: selected UI language
    - source: how the input was captured
    """
    transcript: str = Field(..., min_length=1, max_length=2000)
    draft: PendingDraft = Field(default_factory=PendingDraft)
    lang: Literal["en", "hi", "kn"] = "en"
    source: Literal["voice", "text", "demo"] = "voice"


# ── Parse Response ───────────────────────────────────────────────────────────

class ParseResponse(BaseModel):
    """
    The ONLY response shape the frontend ever receives from /api/voice/parse.

    Reviewer fix #4: `draft` is ALWAYS populated — frontend renders it as-is.
    Enhancement: `action` detects confirm/cancel spoken commands so the
    frontend never interprets voice input itself.
    """
    status: Literal["complete", "clarify", "unknown", "error"]
    entry: Optional[PendingEntry] = None           # populated when status == "complete"
    question: Optional[str] = None                  # the one short question to ask/speak
    question_kind: Optional[str] = None             # variant | teen_tens | damaged_qty | unknown_sku | noise
    candidates: Optional[List[Candidate]] = None    # tap-to-pick list for variant ambiguity
    draft: PendingDraft = Field(default_factory=PendingDraft)  # ALWAYS echo full state
    action: Literal["none", "confirm", "cancel"] = "none"     # detect spoken confirm/cancel
    readback_text: Optional[str] = None             # the read-back string to display/speak
    raw_transcript: Optional[str] = None            # echo for UI display


# ── Confirm Request / Response ───────────────────────────────────────────────

class ConfirmRequest(BaseModel):
    """Frontend sends this when the shopkeeper confirms an entry."""
    entry: PendingEntry
    raw_transcript: str = ""
    lang: Literal["en", "hi", "kn"] = "en"
    source: Literal["voice", "text", "demo"] = "voice"
    was_corrected: bool = False


class ConfirmResponse(BaseModel):
    """Response after a successful stock commit."""
    status: Literal["committed", "duplicate", "error"]
    message: str
    movement_id: Optional[int] = None
    product_name: Optional[str] = None
    usable_stock: Optional[int] = None
    damaged_stock: Optional[int] = None


# ── Stock / Inventory Queries ────────────────────────────────────────────────

class StockItem(BaseModel):
    """Single product stock summary."""
    product_id: int
    product_name: str
    category: str
    usable_stock: int
    damaged_stock: int
    min_threshold: int
    is_low: bool


class StockSummaryResponse(BaseModel):
    """Full inventory overview."""
    items: List[StockItem]
    low_stock_count: int


class MovementRecord(BaseModel):
    """Single stock movement history entry."""
    id: int
    product_name: str
    received: int
    damaged: int
    usable_delta: int
    raw_transcript: Optional[str]
    lang: str
    source: str
    was_corrected: bool
    confirmed_at: str
