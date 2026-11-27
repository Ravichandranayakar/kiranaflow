"""
KiranaFlow — API Routes: Voice Parsing

POST /api/voice/parse
  Receives a transcript + current draft, returns the next ParseResponse.
  The frontend sends everything, the backend decides everything.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.schemas import ParseRequest, ParseResponse
from app.services.catalogue_service import load_catalogue
from app.services.parser import parse_transcript

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/parse", response_model=ParseResponse)
def parse_voice_input(req: ParseRequest, db: Session = Depends(get_db)) -> ParseResponse:
    """
    Parse a voice/text transcript against the shop catalogue.

    The frontend sends:
      - transcript: raw spoken/typed text
      - draft: current pending draft state (empty on first turn)
      - lang: selected language (en/hi/kn)
      - source: voice/text/demo

    The backend returns:
      - ParseResponse with updated draft, possible question, or complete entry
      - draft is ALWAYS echoed in full — frontend never merges locally
    """
    catalogue = load_catalogue(db)

    response = parse_transcript(
        transcript=req.transcript,
        draft=req.draft,
        catalogue=catalogue,
        lang=req.lang,
    )

    # Always set the raw transcript for UI display
    if response.raw_transcript is None:
        response.raw_transcript = req.transcript

    return response
