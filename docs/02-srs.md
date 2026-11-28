# 02 — Software Requirements Specification (SRS)

## 1. Purpose & Scope

This specification documents the verified requirements implemented in **KiranaFlow v0.1.0**, a mobile-first (`max-w-[440px]`) voice delivery and inventory web application backed by FastAPI and PostgreSQL 16.

---

## 2. Functional Requirements

| ID | Requirement | Implemented Behavior & Source |
|----|-------------|-------------------------------|
| **FR-01** | **Push-to-Talk Voice Capture** | Tapping `MicDial` activates browser `SpeechRecognition` (`continuous = false`, `interimResults = true`) without continuous background listening; auto-stops `1.5s` after the last new recognized syllable (`frontend/src/hooks/useDeliveryFlow.ts`, `frontend/src/services/speech.ts`). |
| **FR-02** | **Text & Demo Input Fallback** | Tapping **Or type instead** opens a text form; tapping any of 5 chips in `ExampleStrip` submits sample deliveries via `POST /api/voice/parse` with `source="text"` or `"demo"`. |
| **FR-03** | **Multilingual Alias & Number Parsing** | `parse_transcript()` recognizes English, Hindi, and Kannada aliases across 15 seeded SKUs (`seed.py`) plus EN/HI/KN number words (`ALL_NUMBERS`), colloquial units (`petis`→`crates`, `darjan`→`dozens`, `patta`→`leaves`), and code-switched sentences (`backend/app/services/parser.py`). |
| **FR-04** | **Usable vs. Damaged Separation** | Detects damage keywords (`damaged`, `odada`, `kharab`, `leaky`, etc.) via `_partition_damage()`, assigns nearby quantities to `damaged`, and computes `usable = received - damaged`. Defaults `damaged = 0` when none mentioned. |
| **FR-05** | **Mid-Sentence Self-Correction** | `_apply_self_corrections()` detects markers (`illa`, `illa illa`, `no no`, `nahi`, `actually`, `wait`, `sorry`, `matlab`), slicing number extraction to text after the last marker while preserving full text for product matching. |
| **FR-06** | **Ambiguity & Missing-Field Clarification** | Asks one focused question at a time (`status="clarify"` or `"unknown"`) for: `teen_tens` pairs (`13/30`..`19/90`), `variant` (2+ matching candidates), `damaged_qty` (damage mentioned without nearby count or `damaged > received`), and `unknown_sku`. |
| **FR-07** | **Explicit Confirm-Before-Write Guard** | Sets `draft.awaiting_confirmation = true` and returns localized `readback_text`. Spoken confirm/cancel words (`Confirm`, `Haan`, `Sari`, `Cancel`, `Beda`) are **only** evaluated while `draft.awaiting_confirmation == true` (`_handle_confirmation_turn`). |
| **FR-08** | **Inline Edit & Voice Correction Before Save** | While in `AWAITING_CONFIRMATION`, the user can speak a correction (e.g., `"actually 3 packets are damaged"`) or use **Edit details** in `PendingReceiptCard.tsx`, setting `was_corrected = true` and recalculating `usable`. |
| **FR-09** | **Atomic Stock Commit & Idempotency** | `POST /api/deliveries/confirm` checks `stock_movements.idempotency_key` first, executes atomic SQL `usable_stock = usable_stock + usable_delta` and `damaged_stock = damaged_stock + damaged`, and inserts an audit row in `stock_movements` (`backend/app/routes/delivery.py`). |
| **FR-10** | **Live Stock Ledger & Reorder Draft** | `GET /api/stock` returns all products sorted by category/name with `is_low = usable_stock < min_threshold`. `StockView.tsx` supports `All` / `Low` / `Damaged` filters and **Copy WhatsApp Reorder Draft** (clipboard only, never auto-orders). |
| **FR-11** | **Immutable Movement History** | `GET /api/stock/movements?limit=50` orders records newest-first, surfacing product name, usable delta, damaged count, `raw_transcript`, `lang`, `source`, `was_corrected`, and `confirmed_at`. |
| **FR-12** | **Switchable UI & Spoken Language** | Header toggles `en` (`E`), `hi` (`हि`), and `kn` (`ಕ`) instantaneously across all UI strings (`translations.ts`), speech locale (`en-IN`/`hi-IN`/`kn-IN`), parser prompts/read-backs, and `speechSynthesis` TTS (mutable in `SettingsModal.tsx`). |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement & Verification |
|----|----------|---------------------------|
| **NFR-01** | **Zero External Secrets** | Stack starts and executes end-to-end via `docker compose up --build` with `LLM_API_KEY=""` (`backend/app/config.py`, `docker-compose.yml`). |
| **NFR-02** | **Concurrency & Double-Tap Safety** | Database stock arithmetic uses SQL-level expressions (`Product.usable_stock + delta`) rather than read-modify-write, paired with UI `isConfirmingRef` lock and DB `UNIQUE` `idempotency_key` (`db_models.py`, `delivery.py`). |
| **NFR-03** | **Single Source of Truth** | Frontend never parses quantities or merges clarification state locally; `POST /api/voice/parse` echoes the full `PendingDraft` on every turn (`schemas.py`, `useDeliveryFlow.ts`). |
| **NFR-04** | **Deterministic Testability** | Core NLP/state logic (`parser.py`) is pure Python with no DB or network side effects, verified by 33 pytest cases (`backend/tests/test_parser.py`). |
| **NFR-05** | **UI Resilience** | Root `<ErrorBoundary>` prevents blank white screens; Web Speech `onerror` and 4s no-audio timeouts surface recovery guidance and auto-reveal text input (`ErrorBoundary.tsx`, `MicDial.tsx`). |
| **NFR-06** | **One-Command Portability** | PostgreSQL (`5432`) is exposed only on the internal Docker network to avoid host port clashes; Nginx proxies `/api/` to `backend:8000` cleanly (`docker-compose.yml`, `nginx.conf`). |
