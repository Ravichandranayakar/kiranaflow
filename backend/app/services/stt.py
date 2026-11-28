"""
KiranaFlow — Offline Speech-to-Text Service (faster-whisper + PyAV)

Runs locally inside the backend container with zero API keys required.
Decodes MediaRecorder uploads (.webm, .ogg, .mp4, .wav) in memory via PyAV
and transcribes with the cached CPU INT8 Whisper base model.
"""

from __future__ import annotations

import io
import logging
import os
import threading
from typing import Optional

import av
import numpy as np
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

_model_lock = threading.Lock()
_whisper_model: Optional[WhisperModel] = None
_CPU_THREADS = min(4, os.cpu_count() or 2)

# Bias Whisper decoding toward KiranaFlow's multilingual Indian grocery vocabulary
# while keeping Romanized transcription compatible with parser.py aliases.
KIRANA_PROMPT = (
    "Kirana delivery log: 24 milk packets bandide 2 odada ide, "
    "Nandini milk, doodh, haalu, cheeni, sugar, sakre, Aashirvaad atta 1kg 5kg, "
    "Parle-G, Fortune oil, tel, enne, toor dal, daal, Tata salt, namak, uppu, "
    "Colgate, Maggi, basmati rice, chawal, akki, onion, pyaaz, potato, aloo, "
    "eggs, anda, motte, Surf Excel, packets, crates, petis, kg, bottles, dozens, darjan, "
    "damaged, kharab, leaky, broken, illa illa, actually, confirm, haan, sari, cancel, beda, 14, 40."
)


def get_whisper_model() -> WhisperModel:
    """Load and cache the CPU INT8 Whisper base model as a process singleton."""
    global _whisper_model
    if _whisper_model is None:
        with _model_lock:
            if _whisper_model is None:
                logger.info("Loading offline Whisper 'base' (int8, %d threads) STT model...", _CPU_THREADS)
                try:
                    _whisper_model = WhisperModel(
                        "base",
                        device="cpu",
                        compute_type="int8",
                        cpu_threads=_CPU_THREADS,
                        local_files_only=True,
                    )
                except Exception:
                    _whisper_model = WhisperModel(
                        "base",
                        device="cpu",
                        compute_type="int8",
                        cpu_threads=_CPU_THREADS,
                    )
                logger.info("Whisper STT model ready.")
    return _whisper_model


def _decode_to_mono_16k(audio_bytes: bytes) -> np.ndarray:
    """Decode any container/codec supported by FFmpeg/PyAV into 16kHz mono float32 PCM."""
    resampler = av.AudioResampler(format="flt", layout="mono", rate=16000)
    chunks = []
    with av.open(io.BytesIO(audio_bytes)) as container:
        for frame in container.decode(audio=0):
            for resampled in resampler.resample(frame):
                chunks.append(resampled.to_ndarray().reshape(-1))
        for resampled in resampler.resample(None):
            chunks.append(resampled.to_ndarray().reshape(-1))
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(chunks).astype(np.float32)


def transcribe_audio_bytes(audio_bytes: bytes, suffix: str = ".webm") -> str:
    """
    Transcribe recorded microphone bytes into Romanized/English text
    suitable for KiranaFlow's multilingual parser.
    """
    _ = suffix  # PyAV inspects stream headers directly from bytes
    if not audio_bytes:
        return ""

    audio = _decode_to_mono_16k(audio_bytes)
    if audio.size < 1600:  # < 100ms of audio
        return ""

    model = get_whisper_model()
    segments, _ = model.transcribe(
        audio,
        language="en",
        initial_prompt=KIRANA_PROMPT,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 250},
        beam_size=1,
        best_of=1,
        condition_on_previous_text=False,
        without_timestamps=True,
    )
    parts = [seg.text.strip() for seg in segments if seg.text and seg.text.strip()]
    return " ".join(parts).strip()
