"""
KiranaFlow — API Routes: Voice Parsing & Cross-Browser Speech Transcription

POST /api/voice/transcribe
  Transcribes uploaded browser MediaRecorder audio (.webm/.ogg/.mp4/.wav)
  using the offline Whisper STT service (zero API keys, works on Chrome, Brave, Firefox, Edge).

POST /api/voice/parse
  Receives a transcript + current draft, returns the next ParseResponse.
  The frontend sends everything, the backend decides everything.
"""

from __future__ import annotations

import os
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.schemas import ParseRequest, ParseResponse
from app.services.catalogue_service import load_catalogue
from app.services.parser import parse_transcript
from app.services.stt import transcribe_audio_bytes

router = APIRouter(prefix="/api/voice", tags=["voice"])


class TranscribeResponse(BaseModel):
    transcript: str


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_voice_audio(audio: UploadFile = File(...)) -> TranscribeResponse:
    """Transcribe an audio clip recorded via browser MediaRecorder."""
    data = await audio.read()
    if len(data) < 200:
        return TranscribeResponse(transcript="")

    _, ext = os.path.splitext(audio.filename or "")
    if not ext:
        ctype = (audio.content_type or "").lower()
        if "ogg" in ctype:
            ext = ".ogg"
        elif "mp4" in ctype or "aac" in ctype:
            ext = ".mp4"
        elif "wav" in ctype:
            ext = ".wav"
        else:
            ext = ".webm"

    try:
        transcript = transcribe_audio_bytes(data, suffix=ext)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {exc}") from exc

    return TranscribeResponse(transcript=transcript)


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
