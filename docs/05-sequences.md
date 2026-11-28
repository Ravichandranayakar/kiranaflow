# 05 — Sequence Diagrams

## 1. Voice / Text Parse & Clarification Loop (`POST /api/voice/parse`)

Every spoken or typed turn passes through the same backend parser. The frontend sends `{ transcript, draft, lang, source }` and renders the returned `draft` verbatim without local parsing or merging.

```mermaid
sequenceDiagram
    actor S as Shopkeeper
    participant UI as React UI + MicDial
    participant Hook as useDeliveryFlow.ts
    participant Proxy as Nginx (/api/)
    participant API as FastAPI (voice.py)
    participant Parser as parser.py
    participant DB as PostgreSQL

    S->>UI: Taps Mic & says "14 milk packets"
    Note over Hook: Stops 1.5s after last new speech
    Hook->>Proxy: POST /api/voice/parse {transcript:"14 milk packets", draft:{}, lang:"en", source:"voice"}
    Proxy->>API: Forward JSON payload
    API->>DB: load_catalogue(db) -> 15 products + aliases
    DB-->>API: Catalogue list[dict]
    API->>Parser: parse_transcript("14 milk packets", EmptyDraft, catalogue, "en")
    Note over Parser: 14 in TEEN_TENS_PAIRS (14 vs 40)
    Parser-->>API: ParseResponse(status:"clarify", question_kind:"teen_tens", teen_tens_options:[14,40], draft:{...})
    API-->>UI: 200 OK (full echoed PendingDraft)
    UI->>S: Shows [14] [40] card & speaks "Did you say 14 or 40?"

    S->>UI: Taps "40" (or speaks "40")
    Hook->>Proxy: POST /api/voice/parse {transcript:"40", draft:<echoed draft>, lang:"en", source:"text"}
    Proxy->>API: Forward JSON payload
    API->>Parser: _merge_clarification("40", draft) -> _try_complete()
    Parser-->>API: ParseResponse(status:"complete", draft:{awaiting_confirmation:true, received:40, damaged:0, usable:40}, readback_text:"...")
    API-->>UI: 200 OK (complete entry + readback_text)
    UI->>S: Displays Chartreuse "+40" review card & speaks read-back

    alt Spoken confirmation while awaiting_confirmation == true
        S->>UI: Speaks "Confirm" / "Haan" / "Sari"
        Hook->>API: POST /api/voice/parse {transcript:"confirm", draft:<awaiting draft>}
        API->>Parser: _handle_confirmation_turn()
        Parser-->>API: ParseResponse(status:"complete", action:"confirm", entry:{...})
        API-->>Hook: Proceeds to POST /api/deliveries/confirm
    else Spoken correction while awaiting_confirmation == true
        S->>UI: Speaks "actually 3 packets are damaged"
        Hook->>API: POST /api/voice/parse {transcript:"actually 3...", draft:<awaiting draft>}
        API-->>Hook: ParseResponse(status:"complete", draft:{damaged:3, usable:37, was_corrected:true})
    end
```

---

## 2. Delivery Confirmation, Atomic Update & Idempotency (`POST /api/deliveries/confirm`)

Once the shopkeeper taps **Confirm & Save** or speaks `"Confirm"`, a UUID `idempotency_key` generated in the draft guarantees that accidental double-taps or network retries never double-increment inventory.

```mermaid
sequenceDiagram
    actor S as Shopkeeper
    participant UI as PendingReceiptCard
    participant Hook as useDeliveryFlow.ts
    participant API as FastAPI (delivery.py)
    participant DB as PostgreSQL

    S->>UI: Taps "Confirm & Save"
    Note over Hook: Sets isConfirmingRef.current = true (UI guard)
    Hook->>API: POST /api/deliveries/confirm {entry:{product_id:1, received:24, damaged:2, usable:22, idempotency_key:"uuid"}, ...}

    API->>DB: SELECT * FROM stock_movements WHERE idempotency_key = :key
    alt Key does NOT exist (First Commit)
        DB-->>API: None
        API->>DB: SELECT * FROM products WHERE id = :product_id (Verify exists & damaged <= received)
        API->>DB: UPDATE products SET usable_stock = usable_stock + 22, damaged_stock = damaged_stock + 2 WHERE id = 1
        API->>DB: INSERT INTO stock_movements (..., idempotency_key, usable_delta:22, raw_transcript, was_corrected)
        API->>DB: COMMIT transaction (via get_db)
        DB-->>API: movement.id + refreshed Product totals
        API-->>Hook: 200 OK {status:"committed", usable_stock:22, damaged_stock:2, movement_id:1}
        Hook->>UI: Plays success chime, speaks "Saved 22 usable", refreshes Stock & History
    else Key ALREADY exists (Double-Tap or Network Retry)
        DB-->>API: Existing StockMovement row
        API->>DB: SELECT * FROM products WHERE id = existing.product_id
        API-->>Hook: 200 OK {status:"duplicate", message:"This entry was already saved (safe retry).", usable_stock:22, damaged_stock:2}
        Note over DB: Stock remains untouched — zero double-counting
    end
```
