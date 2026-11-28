# 08 — API Reference

All routes are defined in [`backend/main.py`](../backend/main.py), [`backend/app/routes/voice.py`](../backend/app/routes/voice.py), and [`backend/app/routes/delivery.py`](../backend/app/routes/delivery.py), validated with Pydantic v2 schemas in [`backend/app/models/schemas.py`](../backend/app/models/schemas.py).

Every JSON payload below was captured directly from the running Docker + PostgreSQL 16 stack.

---

## 1. `GET /api/health`

Runs `SELECT 1` against PostgreSQL and reports active parser configuration.

**Response (`200 OK`):**

```json
{
  "status": "healthy",
  "database": "connected",
  "llm_parser": "disabled (deterministic parser active)",
  "default_language": "en"
}
```

---

## 2. `POST /api/voice/parse`

Stateless turn processor that accepts `{ transcript, draft, lang, source }` and always echoes the updated full `PendingDraft`.

### Example A — Complete Kanglish Delivery (`status: "complete"`)

**Request:**

```json
{
  "transcript": "24 milk packets bandide 2 odada ide",
  "draft": {},
  "lang": "en",
  "source": "voice"
}
```

**Response (`200 OK`):**

```json
{
  "status": "complete",
  "entry": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 24,
    "damaged": 2,
    "usable": 22,
    "unit": "packets",
    "idempotency_key": "e280da05-baed-420d-ad18-e43912e99928"
  },
  "question": null,
  "question_kind": null,
  "candidates": null,
  "draft": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 24,
    "damaged": 2,
    "usable": 22,
    "unit": "packets",
    "awaiting_confirmation": true,
    "was_corrected": false,
    "idempotency_key": "e280da05-baed-420d-ad18-e43912e99928",
    "pending_question_kind": null,
    "candidates": null,
    "teen_tens_options": null
  },
  "action": "none",
  "readback_text": "24 packets of Nandini Toned Milk 500ml received, 2 damaged, adding 22 usable to stock. Say Confirm to save, or tell me what to change.",
  "raw_transcript": "24 milk packets bandide 2 odada ide"
}
```

### Example B — Teen/Tens Guard & Clarification Turn 2 (`14` vs `40`)

**Turn 1 Request (`"14 milk packets"`):** → returns `status: "clarify"`:

```json
{
  "status": "clarify",
  "entry": null,
  "question": "Did you say 14 or 40?",
  "question_kind": "teen_tens",
  "candidates": null,
  "draft": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 14,
    "damaged": null,
    "usable": null,
    "unit": "packets",
    "awaiting_confirmation": false,
    "was_corrected": false,
    "idempotency_key": "690d1780-3e7a-4a2c-ba9c-0aa383279b09",
    "pending_question_kind": "teen_tens",
    "candidates": null,
    "teen_tens_options": [14, 40]
  },
  "action": "none",
  "readback_text": null,
  "raw_transcript": "14 milk packets"
}
```

**Turn 2 Request (`"40"` with echoed `draft`)** → resolves `received: 40`, `usable: 40`, `awaiting_confirmation: true`:

```json
{
  "status": "complete",
  "entry": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 40,
    "damaged": 0,
    "usable": 40,
    "unit": "packets",
    "idempotency_key": "2148c506-0804-41fd-a7c5-1151c62eff82"
  },
  "question": null,
  "question_kind": null,
  "candidates": null,
  "draft": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 40,
    "damaged": 0,
    "usable": 40,
    "unit": "packets",
    "awaiting_confirmation": true,
    "was_corrected": false,
    "idempotency_key": "2148c506-0804-41fd-a7c5-1151c62eff82",
    "pending_question_kind": null,
    "candidates": null,
    "teen_tens_options": null
  },
  "action": "none",
  "readback_text": "40 packets of Nandini Toned Milk 500ml received, none damaged, adding 40 to stock. Say Confirm to save, or tell me what to change.",
  "raw_transcript": "40"
}
```

### Example C — Variant Disambiguation, Missing Damaged Qty & Unknown SKU

| Scenario | Sample Transcript | `status` | `question_kind` | Observed `question` |
|----------|-------------------|----------|-----------------|---------------------|
| Variant conflict | `"5 aashirvaad 1kg aashirvaad 5kg"` | `"clarify"` | `"variant"` | `"Which one did you mean: Aashirvaad Atta 1kg or Aashirvaad Atta 5kg?"` (with 2 `candidates`) |
| Missing damage count | `"24 milk packets came in morning crate and some are damaged"` | `"clarify"` | `"damaged_qty"` | `"How many Nandini Toned Milk 500ml are damaged?"` |
| Unlisted item | `"10 packets amul butter"` | `"unknown"` | `"unknown_sku"` | `"I don't have '10 packets amul butter' in the catalogue. Say the brand name again or tap to pick."` |

### Example D — Spoken Confirm, Correction, and Cancel (`awaiting_confirmation: true`)

- **Spoken `"confirm"` / `"haan"` / `"sari"`** → `action: "confirm"`, `entry` preserved for `/api/deliveries/confirm`.
- **Spoken `"actually 3 packets are damaged"`** → recalculates `damaged: 3, usable: 21, was_corrected: true`, stays in `awaiting_confirmation: true` with updated `readback_text`.
- **Spoken `"cancel"` / `"beda"`** → `action: "cancel"`, `draft` cleared back to nulls.

---

## 3. `POST /api/deliveries/confirm`

Atomically updates `products` (`usable_stock` & `damaged_stock`) and inserts an audit row in `stock_movements`.

**Request:**

```json
{
  "entry": {
    "product_id": 1,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 24,
    "damaged": 2,
    "usable": 22,
    "unit": "packets",
    "idempotency_key": "3e6a0d15-55f9-4da2-999a-83c01ff63c55"
  },
  "raw_transcript": "24 milk packets bandide 2 odada ide",
  "lang": "kn",
  "source": "demo",
  "was_corrected": false
}
```

**Response — First Commit (`200 OK`):**

```json
{
  "status": "committed",
  "message": "Saved 22 usable packets of Nandini Toned Milk 500ml. 2 logged for supplier return.",
  "movement_id": 5,
  "product_name": "Nandini Toned Milk 500ml",
  "usable_stock": 84,
  "damaged_stock": 4
}
```

**Response — Retried / Double-Tapped Same `idempotency_key` (`200 OK`):**

```json
{
  "status": "duplicate",
  "message": "This entry was already saved (safe retry).",
  "movement_id": 5,
  "product_name": "Nandini Toned Milk 500ml",
  "usable_stock": 84,
  "damaged_stock": 4
}
```

**Error Codes:** `400` if `damaged > received`; `404` if `product_id` does not exist; `422` on malformed schema.

---

## 3b. `POST /api/deliveries/confirm-batch` & `POST /api/stock/adjust`

- **`POST /api/deliveries/confirm-batch`**: Accepts `{ entries: PendingEntry[], raw_transcript, lang, source, was_corrected }` and commits all items from a multi-item utterance (`"1 kg onion and 4 kg daal"`) inside one atomic PostgreSQL transaction.
- **`POST /api/stock/adjust`**: Accepts `{ product_id, usable_delta, damaged_delta, reason }` (`+` adds stock, `-` subtracts stock). Rejects negative resulting stock with `400` and writes an immutable `stock_movements` audit entry (`source: "manual"`).

---

## 4. `GET /api/stock`

Returns all seeded SKUs ordered by `(category, name)` plus `low_stock_count`.

**Response (`200 OK`, truncated to first 2 of 15 items):**

```json
{
  "items": [
    {
      "product_id": 15,
      "product_name": "Surf Excel Detergent 500g",
      "category": "cleaning",
      "usable_stock": 0,
      "damaged_stock": 0,
      "min_threshold": 5,
      "is_low": true
    },
    {
      "product_id": 14,
      "product_name": "Eggs (12 pack)",
      "category": "dairy",
      "usable_stock": 0,
      "damaged_stock": 0,
      "min_threshold": 5,
      "is_low": true
    }
  ],
  "low_stock_count": 13
}
```

---

## 5. `GET /api/stock/movements?limit=50`

Returns chronological delivery movement records (`confirmed_at DESC`).

**Response (`200 OK`, latest 2 records):**

```json
[
  {
    "id": 4,
    "product_name": "Onion 1kg",
    "received": 4,
    "damaged": 0,
    "usable_delta": 4,
    "raw_transcript": "1kg of onion and 4  kg of caret",
    "lang": "en",
    "source": "text",
    "was_corrected": false,
    "confirmed_at": "2026-11-28T06:19:01.042011+00:00"
  },
  {
    "id": 3,
    "product_name": "Nandini Toned Milk 500ml",
    "received": 40,
    "damaged": 0,
    "usable_delta": 40,
    "raw_transcript": "40",
    "lang": "en",
    "source": "text",
    "was_corrected": false,
    "confirmed_at": "2026-11-27T11:54:40.339828+00:00"
  }
]
```
