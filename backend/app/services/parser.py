"""
KiranaFlow — Deterministic Voice Parser (Python-only, zero LLM dependency)

This is the CORE IP of the prototype. It takes a raw transcript string and
the current PendingDraft, and returns the next state: a completed entry,
a clarification question, or an error.

Reviewer fix #2: Parser is Python-only. Frontend NEVER parses.
Reviewer fix #3: One merge_clarification() function handles all question types.

Rules implemented:
  1. Number extraction (digits + EN/HI/KN number-words)
  2. Product matching via alias dictionary (contains-match, case-insensitive)
  3. Damage keyword detection (damaged, odada, kharab, leaky, tutela, broken, phoota)
  4. Self-correction handling (illa, no, actually, wait, nahi → keep last stated qty)
  5. Teen/tens ambiguity guard (14 vs 40, 13 vs 30, 15 vs 50, 16 vs 60)
  6. Confirm/cancel detection (confirm, haan, sari, yes, cancel, no, nahi, beda)
  7. Slot-filling: asks exactly one question at a time for missing fields
"""

from __future__ import annotations

import re
import uuid
from typing import Dict, List, Optional, Tuple

from app.models.schemas import (
    Candidate,
    ParseResponse,
    PendingDraft,
    PendingEntry,
)

# ── Number-Word Dictionaries (EN / HI / KN) ─────────────────────────────────

EN_NUMBERS: Dict[str, int] = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
    "hundred": 100, "half": 0,
    # Common compound forms
    "twenty one": 21, "twenty two": 22, "twenty three": 23, "twenty four": 24,
    "twenty five": 25, "twenty six": 26, "twenty seven": 27, "twenty eight": 28,
    "twenty nine": 29, "thirty one": 31, "thirty two": 32, "thirty five": 35,
    "forty eight": 48, "fifty six": 56,
}

HI_NUMBERS: Dict[str, int] = {
    "ek": 1, "do": 2, "teen": 3, "chaar": 4, "paanch": 5,
    "chhah": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
    "gyarah": 11, "baarah": 12, "terah": 13, "chaudah": 14,
    "pandrah": 15, "solah": 16, "satrah": 17, "athaarah": 18,
    "unnis": 19, "bees": 20, "pachees": 25, "tees": 30,
    "chaalis": 40, "pachaas": 50, "saath": 60, "sattar": 70,
    "assi": 80, "nabbe": 90, "sau": 100,
    "ikees": 21, "bais": 22, "teis": 23, "chaubees": 24,
    "chhabbees": 26, "sattais": 27, "atthaees": 28, "untees": 29,
}

KN_NUMBERS: Dict[str, int] = {
    "ondu": 1, "eradu": 2, "mooru": 3, "nalku": 4, "aidu": 5,
    "aaru": 6, "elu": 7, "entu": 8, "ombattu": 9, "hattu": 10,
    "hannondu": 11, "hanneradu": 12, "hadimuru": 13, "hadinaalku": 14,
    "hadinaidu": 15, "hadinaaru": 16, "hadineelu": 17, "hadinentu": 18,
    "hattombattu": 19, "ippattu": 20, "ippattaidu": 25, "moovattu": 30,
    "naalattu": 40, "aivattu": 50, "aravattu": 60, "eppattu": 70,
    "embattu": 80, "tombattu": 90, "nooru": 100,
}

ALL_NUMBERS: Dict[str, int] = {**EN_NUMBERS, **HI_NUMBERS, **KN_NUMBERS}

# ── Damage Keywords ──────────────────────────────────────────────────────────

DAMAGE_KEYWORDS = {
    "damaged", "damage", "broken", "leaky", "leak", "leaked",
    "spoiled", "spoilt", "expired", "torn", "crushed",
    # Hindi
    "kharab", "toota", "tuta", "phoota", "phuta", "fataa", "sadaa",
    # Kannada
    "odada", "odeda", "haalada", "tutela", "ketalada",
}

# ── Self-Correction Markers ──────────────────────────────────────────────────

CORRECTION_MARKERS = {
    "illa", "illa illa", "no no", "nahi", "nahi nahi",
    "actually", "wait", "sorry", "correction", "arbeider",
    "not", "i mean", "matlab",
}

# ── Confirm / Cancel Keywords ────────────────────────────────────────────────

CONFIRM_KEYWORDS = {"confirm", "confirmed", "yes", "haan", "ha", "sari", "seri", "ok", "okay", "done", "save"}
CANCEL_KEYWORDS = {"cancel", "cancelled", "no", "nahi", "beda", "bedi", "skip", "discard", "chhodo"}

# ── Unit Keywords ────────────────────────────────────────────────────────────

UNIT_KEYWORDS: Dict[str, str] = {
    "packet": "packets", "packets": "packets", "pack": "packets", "packs": "packets",
    "crate": "crates", "crates": "crates", "peti": "crates", "petis": "crates",
    "kg": "kg", "kilo": "kg", "kilos": "kg", "kilogram": "kg",
    "bottle": "bottles", "bottles": "bottles",
    "piece": "pieces", "pieces": "pieces",
    "dozen": "dozens", "dozens": "dozens", "darjan": "dozens", "darzen": "dozens",
    "patta": "leaves", "bag": "bags", "bags": "bags",
    "tray": "trays", "trays": "trays",
    "box": "boxes", "boxes": "boxes",
}

# ── Teen/Tens Ambiguity Pairs ────────────────────────────────────────────────

TEEN_TENS_PAIRS = {
    13: 30, 14: 40, 15: 50, 16: 60, 17: 70, 18: 80, 19: 90,
    30: 13, 40: 14, 50: 15, 60: 16, 70: 17, 80: 18, 90: 19,
}


MULTI_SPLIT_RE = re.compile(
    r"(?:,|&|\+|(?:\band\b)|(?:\baur\b)|(?:\bmattu\b)|(?:\bplus\b))"
)
_DIGIT_RE = re.compile(r"\b(\d+)\b")
_PUNCT_RE = re.compile(r"[^\w\s-]")
_CORRECTION_RE = re.compile(
    r"\b(?:" + "|".join(re.escape(m) for m in sorted(CORRECTION_MARKERS, key=len, reverse=True)) + r")\b"
)
_NUMBER_WORD_RE = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in sorted(ALL_NUMBERS.keys(), key=len, reverse=True)) + r")\b"
)
_DAMAGE_KW_RE = re.compile(
    r"\b(?:" + "|".join(re.escape(k) for k in sorted(DAMAGE_KEYWORDS, key=len, reverse=True)) + r")\b"
)
_UNIT_KW_RE = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in sorted(UNIT_KEYWORDS.keys(), key=len, reverse=True)) + r")\b"
)


def _has_correction_marker(text_lower: str) -> bool:
    return bool(_CORRECTION_RE.search(text_lower))


def _split_multi_clauses(text_lower: str, catalogue: List[Dict]) -> Optional[List[str]]:
    """
    Split a sentence into independent product clauses only when 2+ clauses
    each contain both a product match and a quantity (across 2+ distinct SKUs).
    Never splits single-item damage lists ('24 milk packets, 2 damaged') or
    self-corrections ('10 oil illa illa 12 oil').
    """
    if _has_correction_marker(text_lower):
        return None
    raw_parts = [p.strip() for p in MULTI_SPLIT_RE.split(text_lower) if p.strip()]
    if len(raw_parts) < 2:
        return None

    matched_ids = set()
    valid_clauses: List[str] = []
    for part in raw_parts:
        part_matches = _match_product(part, catalogue)
        part_nums = _extract_numbers(part)
        if part_matches and part_nums:
            valid_clauses.append(part)
            for m in part_matches:
                matched_ids.add(m["id"])
        else:
            # A fragment like '2 damaged' without a product means this is a single-item utterance
            return None

    if len(valid_clauses) >= 2 and len(matched_ids) >= 2:
        return valid_clauses
    return None


def _format_multi_readback(entries: List[PendingEntry], lang: str) -> str:
    """Format a clear read-back summary across multiple parsed items."""
    parts = []
    for e in entries:
        if e.damaged > 0:
            parts.append(f"{e.received} {e.unit} {e.product_name} ({e.damaged} damaged, {e.usable} usable)")
        else:
            parts.append(f"{e.usable} {e.unit} {e.product_name}")
    joined = "; ".join(parts)
    if lang == "hi":
        return f"{len(entries)} item tayyar hain: {joined}. Sab save karne ke liye 'Haan' bolein."
    if lang == "kn":
        return f"{len(entries)} vasthugalu siddhavide: {joined}. Ellavannu ulisalu 'Sari' heli."
    return f"{len(entries)} items ready: {joined}. Say Confirm to save all, or review below."


def _finalize_multi_queue(
    completed: List[PendingEntry],
    remaining_clauses: List[str],
    catalogue: List[Dict],
    lang: str,
    transcript: str,
) -> ParseResponse:
    """
    Continue resolving remaining multi-item clauses until all complete or one
    needs clarification.
    """
    collected = list(completed)
    queue = list(remaining_clauses)

    while queue:
        next_clause = queue.pop(0)
        res = _parse_single_turn(next_clause, PendingDraft(), catalogue, lang)
        if res.status == "complete" and res.entry is not None:
            collected.append(res.entry)
            continue

        # Pause on this clause for clarification while preserving progress
        paused_draft = res.draft.model_copy()
        paused_draft.queued_entries = collected or None
        paused_draft.queued_clauses = queue or None
        return ParseResponse(
            status=res.status,
            entry=res.entry,
            entries=collected or None,
            question=res.question,
            question_kind=res.question_kind,
            candidates=res.candidates,
            draft=paused_draft,
            readback_text=res.readback_text,
            raw_transcript=transcript,
        )

    first = collected[0]
    summary_draft = PendingDraft(
        product_id=first.product_id,
        product_name=first.product_name,
        received=first.received,
        damaged=first.damaged,
        usable=first.usable,
        unit=first.unit,
        awaiting_confirmation=True,
        idempotency_key=first.idempotency_key,
        queued_entries=collected if len(collected) > 1 else None,
    )
    return ParseResponse(
        status="complete",
        entry=first,
        entries=collected,
        draft=summary_draft,
        readback_text=(
            _format_multi_readback(collected, lang)
            if len(collected) > 1
            else _format_readback(summary_draft, lang)
        ),
        raw_transcript=transcript,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC API
# ═══════════════════════════════════════════════════════════════════════════════

def parse_transcript(
    transcript: str,
    draft: PendingDraft,
    catalogue: List[Dict],
    lang: str = "en",
) -> ParseResponse:
    """
    Main entry point. Takes raw transcript + current draft state and returns
    the next ParseResponse. Supports both single-item and multi-item utterances.
    """
    text = transcript.strip()
    text_lower = text.lower()

    if not text:
        return _error_response(draft, "No input received. Please speak or type the delivery details.")

    # ── Step 0: Check for confirm/cancel if awaiting confirmation ─────────
    if draft.awaiting_confirmation:
        return _handle_confirmation_turn(text_lower, draft, catalogue, lang)

    # ── Step 0b: Handle clarification response if one is pending ──────────
    if draft.pending_question_kind:
        return _merge_clarification(text_lower, draft, catalogue, lang)

    # ── Step 0c: Multi-item delivery sentence detection ───────────────────
    multi_clauses = _split_multi_clauses(text_lower, catalogue)
    if multi_clauses:
        return _finalize_multi_queue([], multi_clauses, catalogue, lang, transcript)

    return _parse_single_turn(transcript, draft, catalogue, lang)


def _parse_single_turn(
    transcript: str,
    draft: PendingDraft,
    catalogue: List[Dict],
    lang: str = "en",
) -> ParseResponse:
    """Parse a single delivery item clause against the catalogue."""
    text = transcript.strip()
    text_lower = text.lower()

    # ── Step 1: Apply self-corrections ──────────────────────────────────
    # For numbers/damage: use corrected text (after last "illa"/"no"/"actually")
    # For product matching: use FULL text so product aliases aren't lost
    cleaned = _apply_self_corrections(text_lower)

    # ── Step 2: Extract all numbers from CORRECTED text ───────────────────
    numbers = _extract_numbers(cleaned)

    # ── Step 3: Detect damage keywords and partition numbers ──────────────
    has_damage_keyword, damage_numbers, received_numbers = _partition_damage(cleaned, numbers)

    # ── Step 4: Match product from FULL text (not corrected) ──────────────
    matches = _match_product(text_lower, catalogue)

    # ── Step 5: Extract unit ──────────────────────────────────────────────
    unit = _extract_unit(cleaned)

    # ── Step 6: Build or update draft ─────────────────────────────────────
    new_draft = draft.model_copy()
    if not new_draft.idempotency_key:
        new_draft.idempotency_key = str(uuid.uuid4())

    # Product resolution
    if len(matches) == 1:
        new_draft.product_id = matches[0]["id"]
        new_draft.product_name = matches[0]["name"]
        if unit is None:
            unit = matches[0].get("default_unit", "packets")
    elif len(matches) > 1:
        # Ambiguous — need clarification
        new_draft.pending_question_kind = "variant"
        new_draft.candidates = [
            Candidate(product_id=m["id"], product_name=m["name"]) for m in matches
        ]
        # Still capture numbers so we don't lose them
        if received_numbers:
            new_draft.received = received_numbers[-1]
        if damage_numbers:
            new_draft.damaged = damage_numbers[-1]
        if unit:
            new_draft.unit = unit

        return ParseResponse(
            status="clarify",
            question=_format_variant_question(matches, lang),
            question_kind="variant",
            candidates=new_draft.candidates,
            draft=new_draft,
            raw_transcript=transcript,
        )
    elif len(matches) == 0 and new_draft.product_id is None:
        # Unknown product
        new_draft.pending_question_kind = "unknown_sku"
        if received_numbers:
            new_draft.received = received_numbers[-1]
        if damage_numbers:
            new_draft.damaged = damage_numbers[-1]
        if unit:
            new_draft.unit = unit

        return ParseResponse(
            status="unknown",
            question=_format_unknown_sku_question(transcript, lang),
            question_kind="unknown_sku",
            draft=new_draft,
            raw_transcript=transcript,
        )

    # Received quantity
    if received_numbers:
        new_draft.received = received_numbers[-1]  # last stated = final after self-correction

    # Damaged quantity
    if damage_numbers:
        new_draft.damaged = damage_numbers[-1]
        new_draft.was_corrected = new_draft.was_corrected or (draft.damaged is not None and draft.damaged != new_draft.damaged)
    elif has_damage_keyword and not damage_numbers:
        # Mentioned damage but no number — ask
        new_draft.pending_question_kind = "damaged_qty"
        if unit:
            new_draft.unit = unit
        return ParseResponse(
            status="clarify",
            question=_format_damaged_qty_question(new_draft.product_name or "the item", lang),
            question_kind="damaged_qty",
            draft=new_draft,
            raw_transcript=transcript,
        )

    if unit:
        new_draft.unit = unit

    # ── Step 7: Teen/Tens ambiguity check ─────────────────────────────────
    if new_draft.received is not None and new_draft.received in TEEN_TENS_PAIRS:
        alt = TEEN_TENS_PAIRS[new_draft.received]
        new_draft.pending_question_kind = "teen_tens"
        new_draft.teen_tens_options = sorted([new_draft.received, alt])
        return ParseResponse(
            status="clarify",
            question=_format_teen_tens_question(new_draft.received, alt, lang),
            question_kind="teen_tens",
            draft=new_draft,
            raw_transcript=transcript,
        )

    # ── Step 8: Check if all required fields are filled ───────────────────
    return _try_complete(new_draft, transcript, lang)


# ═══════════════════════════════════════════════════════════════════════════════
# CLARIFICATION MERGE (Reviewer fix #3: ONE function, all question types)
# ═══════════════════════════════════════════════════════════════════════════════

def _merge_clarification(
    text_lower: str,
    draft: PendingDraft,
    catalogue: List[Dict],
    lang: str,
) -> ParseResponse:
    """
    Merge a clarification response into the pending draft.
    Handles variant, teen_tens, damaged_qty, unknown_sku, and noise identically.
    """
    new_draft = draft.model_copy()
    kind = draft.pending_question_kind
    new_draft.pending_question_kind = None  # clear the pending question

    if kind == "variant":
        # User picked a variant — match by name or ID from candidates
        picked = _resolve_variant(text_lower, draft.candidates or [], catalogue)
        if picked:
            new_draft.product_id = picked["id"]
            new_draft.product_name = picked["name"]
            new_draft.candidates = None
            if new_draft.unit is None:
                new_draft.unit = picked.get("default_unit", "packets")
        else:
            # Couldn't resolve — ask again
            new_draft.pending_question_kind = "variant"
            return ParseResponse(
                status="clarify",
                question=_format_variant_question(
                    [{"id": c.product_id, "name": c.product_name} for c in (draft.candidates or [])],
                    lang,
                ),
                question_kind="variant",
                candidates=draft.candidates,
                draft=new_draft,
                raw_transcript=text_lower,
            )

    elif kind == "teen_tens":
        # User confirmed one of the two options
        numbers = _extract_numbers(text_lower)
        options = draft.teen_tens_options or []
        chosen = None
        for n in numbers:
            if n in options:
                chosen = n
                break
        if chosen is None:
            # Try keyword matching: "first" / "second", or the words themselves
            for opt in options:
                if str(opt) in text_lower:
                    chosen = opt
                    break
        if chosen is not None:
            new_draft.received = chosen
            new_draft.teen_tens_options = None
        else:
            # Couldn't resolve — ask again
            new_draft.pending_question_kind = "teen_tens"
            return ParseResponse(
                status="clarify",
                question=_format_teen_tens_question(options[0], options[1], lang),
                question_kind="teen_tens",
                draft=new_draft,
                raw_transcript=text_lower,
            )

    elif kind == "damaged_qty":
        numbers = _extract_numbers(text_lower)
        if numbers:
            new_draft.damaged = numbers[-1]
        elif any(w in text_lower.split() for w in ("no", "none", "zero", "nahi", "illa", "0")):
            new_draft.damaged = 0
        else:
            new_draft.pending_question_kind = "damaged_qty"
            return ParseResponse(
                status="clarify",
                question=_format_damaged_qty_question(new_draft.product_name or "the item", lang),
                question_kind="damaged_qty",
                draft=new_draft,
                raw_transcript=text_lower,
            )

    elif kind == "unknown_sku":
        # User restated the product — try matching again
        matches = _match_product(text_lower, catalogue)
        if len(matches) == 1:
            new_draft.product_id = matches[0]["id"]
            new_draft.product_name = matches[0]["name"]
            if new_draft.unit is None:
                new_draft.unit = matches[0].get("default_unit", "packets")
        elif len(matches) > 1:
            new_draft.pending_question_kind = "variant"
            new_draft.candidates = [
                Candidate(product_id=m["id"], product_name=m["name"]) for m in matches
            ]
            return ParseResponse(
                status="clarify",
                question=_format_variant_question(matches, lang),
                question_kind="variant",
                candidates=new_draft.candidates,
                draft=new_draft,
                raw_transcript=text_lower,
            )
        else:
            new_draft.pending_question_kind = "unknown_sku"
            return ParseResponse(
                status="unknown",
                question=_format_unknown_sku_question(text_lower, lang),
                question_kind="unknown_sku",
                draft=new_draft,
                raw_transcript=text_lower,
            )

    elif kind == "noise":
        # Re-parse fresh from the corrected input
        new_draft.pending_question_kind = None
        return _parse_single_turn(text_lower, new_draft, catalogue, lang)

    return _try_complete(new_draft, text_lower, lang, catalogue)


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIRMATION HANDLING
# ═══════════════════════════════════════════════════════════════════════════════

def _tokenize_words(text: str) -> set:
    """Split text into lowercase words while ignoring trailing punctuation such as '.' or ','."""
    return set(_PUNCT_RE.sub(" ", text.lower()).split())


def _handle_confirmation_turn(
    text_lower: str,
    draft: PendingDraft,
    catalogue: List[Dict],
    lang: str,
) -> ParseResponse:
    """Handle spoken input while awaiting confirmation."""
    words = _tokenize_words(text_lower)

    # Check for cancel
    if words & CANCEL_KEYWORDS:
        new_draft = PendingDraft()  # reset
        return ParseResponse(
            status="complete",
            action="cancel",
            draft=new_draft,
            raw_transcript=text_lower,
        )

    # Check for confirm
    if words & CONFIRM_KEYWORDS:
        batch = draft.queued_entries if draft.queued_entries else None
        primary = PendingEntry(
            product_id=draft.product_id,  # type: ignore
            product_name=draft.product_name,  # type: ignore
            received=draft.received,  # type: ignore
            damaged=draft.damaged or 0,
            usable=draft.usable,  # type: ignore
            unit=draft.unit or "packets",
            idempotency_key=draft.idempotency_key,  # type: ignore
        )
        return ParseResponse(
            status="complete",
            action="confirm",
            entry=primary,
            entries=batch,
            draft=draft,
            readback_text=(
                _format_multi_readback(batch, lang)
                if batch and len(batch) > 1
                else _format_readback(draft, lang)
            ),
            raw_transcript=text_lower,
        )

    # Neither confirm nor cancel — treat as a correction
    new_draft = draft.model_copy()
    new_draft.awaiting_confirmation = False
    new_draft.was_corrected = True

    # Try to extract correction (e.g., "3 are damaged", "no, 40 packets")
    numbers = _extract_numbers(text_lower)
    has_damage = any(w in text_lower for w in DAMAGE_KEYWORDS)

    if has_damage and numbers:
        new_draft.damaged = numbers[-1]
        if new_draft.received is not None:
            new_draft.usable = new_draft.received - new_draft.damaged
        return _try_complete(new_draft, text_lower, lang)
    elif numbers:
        # Assume correcting received quantity
        new_draft.received = numbers[-1]
        if new_draft.damaged is not None:
            new_draft.usable = new_draft.received - new_draft.damaged
        # Check teen/tens on corrected number
        if new_draft.received in TEEN_TENS_PAIRS:
            alt = TEEN_TENS_PAIRS[new_draft.received]
            new_draft.pending_question_kind = "teen_tens"
            new_draft.teen_tens_options = sorted([new_draft.received, alt])
            return ParseResponse(
                status="clarify",
                question=_format_teen_tens_question(new_draft.received, alt, lang),
                question_kind="teen_tens",
                draft=new_draft,
                raw_transcript=text_lower,
            )
        return _try_complete(new_draft, text_lower, lang)

    # Can't parse correction — ask to repeat
    return ParseResponse(
        status="clarify",
        question="I didn't catch the correction. Please say the updated quantity.",
        question_kind="noise",
        draft=new_draft,
        raw_transcript=text_lower,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# INTERNAL HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _apply_self_corrections(text: str) -> str:
    """
    Handle mid-sentence self-corrections.
    "10 oil packets illa illa 12 packets 1 leaky" → keeps text after last correction marker.
    """
    matches = list(_CORRECTION_RE.finditer(text))
    if matches:
        corrected = text[matches[-1].end():].strip()
        if corrected:
            return corrected
    return text


def _extract_numbers(text: str) -> List[int]:
    """
    Extract all numbers from text, checking both digit patterns and
    precompiled EN/HI/KN number-word patterns in order of appearance.
    """
    results: List[Tuple[int, int]] = []  # (position, value)

    for match in _DIGIT_RE.finditer(text):
        results.append((match.start(), int(match.group(1))))

    for match in _NUMBER_WORD_RE.finditer(text):
        word = match.group(1)
        pos = match.start()
        if not any(abs(pos - p) < len(word) for p, _ in results):
            results.append((pos, ALL_NUMBERS[word]))

    results.sort(key=lambda x: x[0])
    return [v for _, v in results]


def _partition_damage(
    text: str, numbers: List[int]
) -> Tuple[bool, List[int], List[int]]:
    """
    Determine which numbers refer to damaged items vs received.
    """
    damage_keyword_positions = [m.start() for m in _DAMAGE_KW_RE.finditer(text)]
    if not damage_keyword_positions:
        return False, [], numbers

    if not numbers:
        return True, [], []

    digit_matches: List[Tuple[int, int]] = [
        (m.start(), int(m.group(1))) for m in _DIGIT_RE.finditer(text)
    ]
    if not digit_matches:
        return True, [], []

    damage_match_positions: set = set()
    for kw_pos in damage_keyword_positions:
        best_dist = float('inf')
        best_idx = -1
        for i, (d_pos, _) in enumerate(digit_matches):
            dist = abs(d_pos - kw_pos)
            if dist < best_dist and dist < 30:
                best_dist = dist
                best_idx = i
        if best_idx >= 0:
            damage_match_positions.add(best_idx)

    damage_numbers = []
    received_numbers = []
    for i, (_, d_val) in enumerate(digit_matches):
        if i in damage_match_positions:
            damage_numbers.append(d_val)
        else:
            received_numbers.append(d_val)

    if not damage_numbers and not received_numbers:
        if len(numbers) >= 2:
            received_numbers = [numbers[0]]
            damage_numbers = [numbers[1]]
        else:
            received_numbers = numbers

    return True, damage_numbers, received_numbers


def _match_product(text: str, catalogue: List[Dict]) -> List[Dict]:
    """
    Match spoken text against catalogue items using alias contains-matching.
    Returns list of matching catalogue entries (may be 0, 1, or multiple).
    """
    matches = []
    text_words = _tokenize_words(text)

    for item in catalogue:
        for alias in item.get("aliases", []):
            alias_lower = alias.lower()
            # Exact word match for single-word aliases
            if " " not in alias_lower:
                if alias_lower in text_words:
                    matches.append(item)
                    break
            else:
                # Multi-word alias: check if all words appear in text
                alias_words = alias_lower.split()
                if all(w in text_words for w in alias_words):
                    matches.append(item)
                    break

    # Deduplicate by product ID
    seen_ids = set()
    unique = []
    for m in matches:
        if m["id"] not in seen_ids:
            seen_ids.add(m["id"])
            unique.append(m)

    return unique


def _extract_unit(text: str) -> Optional[str]:
    """Extract the unit from text using the precompiled unit pattern."""
    match = _UNIT_KW_RE.search(text)
    return UNIT_KEYWORDS[match.group(1)] if match else None


def _resolve_variant(
    text: str, candidates: List[Candidate], catalogue: List[Dict]
) -> Optional[Dict]:
    """Try to resolve which variant the user picked from candidates."""
    text_clean = text.strip().lower()

    def _find_item(candidate: Candidate) -> Optional[Dict]:
        for item in catalogue:
            if item["id"] == candidate.product_id:
                return item
        return None

    # 1. Exact or full candidate name match first (handles tapping any candidate card)
    for candidate in candidates:
        name_lower = candidate.product_name.lower()
        if name_lower == text_clean or name_lower in text_clean:
            return _find_item(candidate)

    # 2. Size / variant keywords (handles bare "1 kg", "5 kg", "small", "big", etc.)
    size_patterns = {
        "1kg": ["1 kg", "1 kilo", "1kg", "one kg", "one kilo", "chhota", "chota", "small", "sanna"],
        "5kg": ["5 kg", "5 kilo", "5kg", "five kg", "five kilo", "bada", "big", "dodda", "large"],
        "500ml": ["500 ml", "500ml", "half liter", "half litre", "aadha"],
        "1l": ["1 l", "1l", "1 liter", "1 litre", "one liter", "one litre"],
        "small": ["small", "chhota", "chota", "sanna"],
        "big": ["big", "bada", "dodda", "large"],
    }
    for size, keywords in size_patterns.items():
        if any(kw in text_clean for kw in keywords):
            for candidate in candidates:
                if size in candidate.product_name.lower():
                    return _find_item(candidate)

    # 3. Distinguishing word match (words unique to one candidate, not shared across all)
    if candidates:
        word_sets = [set(c.product_name.lower().split()) for c in candidates]
        shared_words = set.intersection(*word_sets) if len(word_sets) > 1 else set()
        for candidate in candidates:
            unique_words = [
                w for w in candidate.product_name.lower().split()
                if len(w) > 1 and w not in shared_words
            ]
            if any(w in text_clean for w in unique_words):
                return _find_item(candidate)

    return None


def _try_complete(
    draft: PendingDraft,
    transcript: str,
    lang: str,
    catalogue: Optional[List[Dict]] = None,
) -> ParseResponse:
    """
    Check if all required fields are filled. If yes, set awaiting_confirmation
    (or advance any remaining queued multi-item clauses). If not, ask for the
    first missing field.
    """
    new_draft = draft.model_copy()

    # Ensure idempotency key exists
    if not new_draft.idempotency_key:
        new_draft.idempotency_key = str(uuid.uuid4())

    # Required: product, received
    if new_draft.product_id is None:
        return ParseResponse(
            status="clarify",
            question="Which product is this delivery for? Say the product name.",
            question_kind="unknown_sku",
            draft=new_draft,
            raw_transcript=transcript,
        )

    if new_draft.received is None:
        return ParseResponse(
            status="clarify",
            question=f"How many {new_draft.unit or 'units'} of {new_draft.product_name} did you receive?",
            question_kind="damaged_qty",
            draft=new_draft,
            raw_transcript=transcript,
        )

    # Default damaged to 0 if not mentioned
    if new_draft.damaged is None:
        new_draft.damaged = 0

    # Validate: damaged cannot exceed received
    if new_draft.damaged > new_draft.received:
        new_draft.damaged = None
        new_draft.pending_question_kind = "damaged_qty"
        return ParseResponse(
            status="clarify",
            question=f"Damaged count can't be more than received ({new_draft.received}). How many are damaged?",
            question_kind="damaged_qty",
            draft=new_draft,
            raw_transcript=transcript,
        )

    # Compute usable
    new_draft.usable = new_draft.received - new_draft.damaged

    # Default unit
    if new_draft.unit is None:
        new_draft.unit = "packets"

    entry = PendingEntry(
        product_id=new_draft.product_id,  # type: ignore
        product_name=new_draft.product_name,  # type: ignore
        received=new_draft.received,
        damaged=new_draft.damaged,
        usable=new_draft.usable,
        unit=new_draft.unit,
        idempotency_key=new_draft.idempotency_key,  # type: ignore
    )

    # If clarifying part of a multi-item delivery, resume remaining clauses
    if (new_draft.queued_clauses or new_draft.queued_entries) and catalogue is not None:
        prior = list(new_draft.queued_entries or [])
        prior.append(entry)
        remaining = list(new_draft.queued_clauses or [])
        return _finalize_multi_queue(prior, remaining, catalogue, lang, transcript)

    # Set awaiting confirmation
    new_draft.awaiting_confirmation = True
    readback = _format_readback(new_draft, lang)

    return ParseResponse(
        status="complete",
        entry=entry,
        entries=[entry],
        draft=new_draft,
        readback_text=readback,
        raw_transcript=transcript,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# READBACK / QUESTION FORMATTERS
# ═══════════════════════════════════════════════════════════════════════════════

def _format_readback(draft: PendingDraft, lang: str) -> str:
    """Format the confirmation read-back in the selected language."""
    name = draft.product_name or "Unknown product"
    received = draft.received or 0
    damaged = draft.damaged or 0
    usable = draft.usable or 0
    unit = draft.unit or "packets"

    if lang == "hi":
        if damaged > 0:
            return (
                f"{received} {unit} {name} mila, {damaged} kharab, "
                f"{usable} upyog mein. Confirm karne ke liye 'Haan' bolein."
            )
        return f"{received} {unit} {name} mila, sab theek. Confirm karne ke liye 'Haan' bolein."

    if lang == "kn":
        if damaged > 0:
            return (
                f"{received} {unit} {name} bandide, {damaged} odada, "
                f"{usable} upayogakke. Confirm maadalu 'Sari' heli."
            )
        return f"{received} {unit} {name} bandide, ella sari ide. Confirm maadalu 'Sari' heli."

    # Default: English
    if damaged > 0:
        return (
            f"{received} {unit} of {name} received, {damaged} damaged, "
            f"adding {usable} usable to stock. Say Confirm to save, or tell me what to change."
        )
    return (
        f"{received} {unit} of {name} received, none damaged, "
        f"adding {usable} to stock. Say Confirm to save, or tell me what to change."
    )


def _format_variant_question(matches: List[Dict], lang: str) -> str:
    names = [m["name"] for m in matches]
    options = " or ".join(names)
    if lang == "hi":
        return f"Kaun sa: {options}?"
    if lang == "kn":
        return f"Yaavudu: {options}?"
    return f"Which one did you mean: {options}?"


def _format_teen_tens_question(a: int, b: int, lang: str) -> str:
    low, high = sorted([a, b])
    if lang == "hi":
        return f"Aapne {low} bola ya {high}?"
    if lang == "kn":
        return f"Neevu {low} heldira athava {high}?"
    return f"Did you say {low} or {high}?"


def _format_damaged_qty_question(product_name: str, lang: str) -> str:
    if lang == "hi":
        return f"{product_name} ke kitne kharab hain?"
    if lang == "kn":
        return f"{product_name} eshtu odada ide?"
    return f"How many {product_name} are damaged?"


def _format_unknown_sku_question(transcript: str, lang: str) -> str:
    if lang == "hi":
        return f"'{transcript}' catalogue mein nahi mila. Brand naam dobara bolein."
    if lang == "kn":
        return f"'{transcript}' catalogue nalli sigalilla. Brand hesaru matte heli."
    return f"I don't have '{transcript}' in the catalogue. Say the brand name again or tap to pick."


def _error_response(draft: PendingDraft, message: str) -> ParseResponse:
    return ParseResponse(
        status="error",
        question=message,
        question_kind="noise",
        draft=draft,
    )
