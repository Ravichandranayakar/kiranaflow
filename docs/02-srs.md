# 02 — Software Requirements Specification (SRS)

## 1. Purpose & Scope

This specification documents the verified requirements implemented in **KiranaFlow v0.1.0**, a mobile-first (`max-w-[440px]`) voice delivery and inventory web application backed by FastAPI and PostgreSQL 16.

---

## 2. Functional Requirements

| ID | Requirement | Implemented Behavior & Source |
|----|-------------|-------------------------------|
| **FR-01** | **Hands-Free Voice & Follow-Up Loop** | Tapping `MicDial` (or the inline card mic button) activates cross-browser `MediaRecorder` + Web Audio `12.5 Hz` adaptive VAD (`200ms` baseline, `1.0s` post-speech silence auto-stop, `7s` no-voice cutoff) uploading to `POST /api/voice/intake`. On voice turns, `350ms` after spoken read-back or clarification finishes (`speakText`), the mic automatically re-opens once for hands-free `"OK"` / `"Confirm"` / edit replies (`useDeliveryFlow.ts`, `speech.ts`). |
| **FR-02** | **Text & Demo Input Fallback** | Tapping **Or type instead** opens a text form; tapping any of 6 chips in `ExampleStrip` (`Normal entry`, `14 or 40?`, `Self-correction`, `Unknown product`, `Hindi sugar`, `2 items at once`) submits sample deliveries via `POST /api/voice/parse` with `source="text"` or `"demo"`. |
| **FR-03** | **Flexible Multilingual SKU & Number Parsing** | `parse_transcript()` matches products via a 3-tier `_match_product()` cascade (exact EN/HI/KN aliases -> casual short brand tokens like `"atta"`, `"oil"`, `"parle"` -> conservative same-initial fuzzy match like `"magi"`, `"colget"`, `"nandhini"`), plus EN/HI/KN number words (`ALL_NUMBERS`), colloquial units (`petis`, `darjan`, `patta`), and code-switched input (`backend/app/services/parser.py`). |
| **FR-04** | **Usable vs. Damaged Separation** | Detects damage keywords (`damaged`, `odada`, `kharab`, `leaky`, etc.) via `_partition_damage()`, assigns nearby quantities to `damaged`, and computes `usable = received - damaged`. Defaults `damaged = 0` when none mentioned. |
| **FR-05** | **Mid-Sentence Self-Correction** | `_apply_self_corrections()` detects markers (`illa`, `illa illa`, `no no`, `nahi`, `actually`, `wait`, `sorry`, `matlab`), slicing number extraction to text after the last marker while preserving full text for product matching. |
| **FR-06** | **Ambiguity, "Both" & Missing-Field Clarification** | Asks one focused question at a time (`status="clarify"` or `"unknown"`) for: `teen_tens` pairs (`13/30`..`19/90`), `variant` (supports picking 1 candidate OR saying `"both"` / tapping **Select All / Both**), `received_qty` (missing quantity in multi-item queues), `damaged_qty`, and `unknown_sku`. |
| **FR-07** | **Explicit Confirm-Before-Write Guard** | Sets `draft.awaiting_confirmation = true` and returns localized `readback_text`. Spoken confirm/cancel words (`OK`, `Ya`, `Confirm`, `Haan`, `Houdu`, `Sari`, `Cancel`, `Beda`) are **only** evaluated while `draft.awaiting_confirmation == true` (`_handle_confirmation_turn`), preserving confirmation readiness even if an unclear edit phrase needs repeating. |
| **FR-08** | **Inline Edit & Voice Correction Before Save** | While in `AWAITING_CONFIRMATION`, the user can speak single or dual corrections (`"28 packets and 3 damaged"`), target an item in a multi-item batch (`"maggi 12"`), or use **Edit details** in `PendingReceiptCard.tsx`, setting `was_corrected = true` and recalculating `usable`. |
| **FR-09** | **Atomic Stock Commit & Idempotency** | `POST /api/deliveries/confirm` (and `POST /api/deliveries/confirm-batch` for multi-item turns) checks `stock_movements.idempotency_key` first, executes atomic SQL `usable_stock = usable_stock + usable_delta` and `damaged_stock = damaged_stock + damaged`, and inserts audit row(s) in `stock_movements` (`backend/app/routes/delivery.py`). |
| **FR-10** | **Live Stock Ledger, Adjustments & Catalogue** | `GET /api/stock` returns all products sorted by category/name with `is_low = usable_stock < min_threshold`. `StockView.tsx` supports `All` / `Low` / `Damaged` filters, manual `+`/`-` adjustments (`POST /api/stock/adjust` with negative guard), **Add Item** / delete SKU (`POST/DELETE /api/stock/products`), and **Copy WhatsApp Reorder Draft** (clipboard only). |
| **FR-11** | **Immutable Movement History** | `GET /api/stock/movements?limit=50` orders records newest-first, surfacing product name, usable delta, damaged count, `raw_transcript`, `lang`, `source`, `was_corrected`, and `confirmed_at`. |
| **FR-12** | **Decoupled Live UI & Spoken Read-Back Language** | Header toggles `en` (`E`), `hi` (`हि`), and `kn` (`ಕ`) instantaneously across all UI copy, badges, units, Stock/History/Settings views, and `READ-BACK` / clarification text (even midway through an entry), updating `speechSynthesis` (`en-IN`/`hi-IN`/`kn-IN`) and transparently flagging missing OS voices via `hasBrowserVoice()` while still accepting mixed EN/HI/KN input (`translations.ts`, `speech.ts`). |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement & Verification |
|----|----------|---------------------------|
| **NFR-01** | **Zero External Secrets** | Stack starts and executes end-to-end via `docker compose up --build` with `LLM_API_KEY=""` (`backend/app/config.py`, `docker-compose.yml`). |
| **NFR-02** | **Concurrency & Double-Tap Safety** | Database stock arithmetic uses SQL-level expressions (`Product.usable_stock + delta`) rather than read-modify-write, paired with UI `isConfirmingRef` lock and DB `UNIQUE` `idempotency_key` (`db_models.py`, `delivery.py`). |
| **NFR-03** | **Single Source of Truth** | Frontend never parses quantities or merges clarification state locally; `POST /api/voice/parse` echoes the full `PendingDraft` on every turn (`schemas.py`, `useDeliveryFlow.ts`). |
| **NFR-04** | **Deterministic Testability** | Core NLP/state logic (`parser.py`) is pure Python with no DB or network side effects, verified by 42 pytest cases (`backend/tests/test_parser.py`). |
| **NFR-05** | **UI Resilience** | Root `<ErrorBoundary>` prevents blank white screens; `MediaRecorder` permission/capture errors and `7s` no-voice timeouts surface recovery guidance and keep **Or type instead** available (`ErrorBoundary.tsx`, `MicDial.tsx`). |
| **NFR-06** | **One-Command Portability** | PostgreSQL (`5432`) is exposed only on the internal Docker network to avoid host port clashes; Nginx proxies `/api/` to `backend:8000` cleanly (`docker-compose.yml`, `nginx.conf`). |
