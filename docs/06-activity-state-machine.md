# 06 — State Machine & Deterministic Parser Activity Flow

## 1. Frontend Delivery Flow State Machine (`useDeliveryFlow.ts`)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> LISTENING: Tap Mic (SpeechRecognition starts)
    IDLE --> PROCESSING: Submit text / Tap Test Case chip

    LISTENING --> PROCESSING: 1.5s silence after new speech OR tap stop (spoken text non-empty)
    LISTENING --> IDLE: Empty speech / 4s no-audio / Error (shows text box)
    LISTENING --> AWAITING_CONFIRMATION: Empty speech while draft awaiting confirmation

    PROCESSING --> NEEDS_CLARIFICATION: status = "clarify" or "unknown"
    PROCESSING --> AWAITING_CONFIRMATION: status = "complete" (action = "none")
    PROCESSING --> COMMITTED: action = "confirm" -> confirmDelivery() succeeds
    PROCESSING --> IDLE: action = "cancel"
    PROCESSING --> ERROR: status = "error" or API failure

    NEEDS_CLARIFICATION --> LISTENING: Tap Mic to answer
    NEEDS_CLARIFICATION --> PROCESSING: Tap option pill / Submit text answer
    NEEDS_CLARIFICATION --> IDLE: Tap Cancel

    AWAITING_CONFIRMATION --> LISTENING: Tap Mic to speak confirm/cancel/correction
    AWAITING_CONFIRMATION --> PROCESSING: Tap Confirm & Save OR submit voice/text
    AWAITING_CONFIRMATION --> AWAITING_CONFIRMATION: Inline Edit Details (local recalculation, was_corrected=true)
    AWAITING_CONFIRMATION --> IDLE: Tap Cancel entry

    COMMITTED --> IDLE: Tap Next Entry or Open Stock Ledger
    ERROR --> IDLE: Tap Reset / Retry
```

---

## 2. Backend Parser Activity Diagram (`parser.py`)

This mirrors the exact execution order inside `parse_transcript()` in [`backend/app/services/parser.py`](../backend/app/services/parser.py):

```mermaid
flowchart TD
    Start(["parse_transcript(transcript, draft, catalogue, lang)"]) --> Empty{"transcript.strip()\nempty?"}
    Empty -->|Yes| ErrResp(["status = error\nquestion_kind = noise"])
    Empty -->|No| WaitConf{"draft.awaiting_confirmation\n== true?"}

    WaitConf -->|Yes| ConfirmKw{"Confirm keyword?\n(confirm/haan/sari/ok/save)"}
    ConfirmKw -->|Yes| RetConfirm(["status = complete\naction = confirm"])
    ConfirmKw -->|No| CancelKw{"Cancel keyword?\n(cancel/no/nahi/beda)"}
    CancelKw -->|Yes| RetCancel(["status = complete\naction = cancel, reset draft"])
    CancelKw -->|No| CorrTurn["Set was_corrected = true\nExtract updated damaged/received"]
    CorrTurn --> CorrTeen{"Corrected received\nin TEEN_TENS_PAIRS?"}
    CorrTeen -->|Yes| RetTeenCorr(["status = clarify (teen_tens)"])
    CorrTeen -->|No| TryComplete

    WaitConf -->|No| PendingQ{"draft.pending_question_kind\nset?"}
    PendingQ -->|Yes| MergeClar["_merge_clarification()\n(variant / teen_tens / damaged_qty / unknown_sku / noise)"]
    MergeClar --> TryComplete

    PendingQ -->|No| Step1["_apply_self_corrections()\nSlice numbers after last 'illa/no/actually'"]
    Step1 --> Step2["_extract_numbers() + _partition_damage()\n(digit near damage keyword within 30 chars)"]
    Step2 --> Step3["_match_product() on FULL text\n(case-insensitive word/phrase aliases)"]
    Step3 --> MatchCount{"matches count?"}

    MatchCount -->|"> 1 candidate"| RetVariant(["status = clarify\nquestion_kind = variant"])
    MatchCount -->|"0 and draft.product_id is None"| RetUnknown(["status = unknown\nquestion_kind = unknown_sku"])
    MatchCount -->|"== 1"| AssignProd["Assign product_id, product_name, unit\n& received / damaged counts"]

    AssignProd --> DmgMissing{"has_damage_keyword AND\nnot damage_numbers?"}
    DmgMissing -->|Yes| RetDmgQty(["status = clarify\nquestion_kind = damaged_qty"])
    DmgMissing -->|No| TeenCheck{"received in\nTEEN_TENS_PAIRS?"}
    TeenCheck -->|Yes| RetTeen(["status = clarify\nquestion_kind = teen_tens"])
    TeenCheck -->|No| TryComplete["_try_complete()\nCheck required slots & damaged <= received"]

    TryComplete --> Complete{"product_id & received set\nand damaged <= received?"}
    Complete -->|No| AskMissing(["status = clarify\n(unknown_sku or damaged_qty)"])
    Complete -->|Yes| Ready(["usable = received - damaged\nawaiting_confirmation = true\nstatus = complete + readback_text"])
```

---

## 3. Verified Rule Dictionaries (`parser.py`)

| Rule Category | Values Implemented |
|---------------|--------------------|
| **Correction markers** | `illa`, `illa illa`, `no no`, `nahi`, `nahi nahi`, `actually`, `wait`, `sorry`, `correction`, `arbeider`, `not`, `i mean`, `matlab` |
| **Damage keywords** | `damaged`, `damage`, `broken`, `leaky`, `leak`, `leaked`, `spoiled`, `spoilt`, `expired`, `torn`, `crushed`; **HI:** `kharab`, `toota`, `tuta`, `phoota`, `phuta`, `fataa`, `sadaa`; **KN:** `odada`, `odeda`, `haalada`, `tutela`, `ketalada` |
| **Confirm / Cancel** | **Confirm:** `confirm`, `confirmed`, `yes`, `haan`, `ha`, `sari`, `seri`, `ok`, `okay`, `done`, `save`; **Cancel:** `cancel`, `cancelled`, `no`, `nahi`, `beda`, `bedi`, `skip`, `discard`, `chhodo` |
| **Colloquial units** | `packet`/`pack`→`packets`, `peti`/`petis`/`crate`→`crates`, `kg`/`kilo`/`kilogram`→`kg`, `bottle`→`bottles`, `piece`→`pieces`, `darjan`/`darzen`/`dozen`→`dozens`, `patta`→`leaves`, `bag`, `tray`, `box` |
| **Teen/Tens guard** | Bidirectional pairs: `13↔30`, `14↔40`, `15↔50`, `16↔60`, `17↔70`, `18↔80`, `19↔90` |
| **Number words** | English (`zero`..`hundred` + common compounds), Hindi (`ek`..`sau`), Kannada (`ondu`..`nooru`) |
