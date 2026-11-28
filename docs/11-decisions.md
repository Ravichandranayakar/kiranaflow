# 11 — Architecture Decision Records (ADRs)

## ADR-001: Deterministic Python Parser Instead of Mandatory Runtime LLM

- **Context:** Calling external LLM APIs for every utterance introduces API key setup friction, per-call latency, network failure modes, and non-deterministic hallucinated JSON fields during judge evaluation.
- **Decision:** Implement the primary parsing engine cleanly in pure Python ([`backend/app/services/parser.py`](../backend/app/services/parser.py)) using multilingual alias dictionaries, number-word tables (EN/HI/KN), regex partitioning, and rule-based disambiguation, while keeping `LLM_API_KEY` strictly optional in [`backend/app/config.py`](../backend/app/config.py).
- **Consequences:** Works out of the box with zero secrets via `docker compose up --build`, executes deterministically in sub-millisecond time, and runs 33 fast unit tests without network or database dependencies.

---

## ADR-002: Backend-Echoed Full `PendingDraft` ("Backend Decides, Frontend Renders")

- **Context:** Splitting clarification merge logic across TypeScript and Python causes state drift, hard-to-reproduce UI bugs, and duplicated regex heuristics.
- **Decision:** Every `POST /api/voice/parse` response ([`backend/app/models/schemas.py`](../backend/app/models/schemas.py)) echoes the complete `PendingDraft` object (`product_id`, `received`, `damaged`, `usable`, `idempotency_key`, `pending_question_kind`, `candidates`, `teen_tens_options`, `awaiting_confirmation`). [`useDeliveryFlow.ts`](../frontend/src/hooks/useDeliveryFlow.ts) stores and renders the echoed state verbatim.
- **Consequences:** Voice turns, typed text turns, and demo test-case chips share one single source of truth; debugging a multi-turn bug requires inspecting only API JSON payloads.

---

## ADR-003: Atomic SQL Updates Instead of Read–Modify–Write

- **Context:** Computing `product.usable_stock = product.usable_stock + delta` inside Python after a `SELECT` creates race conditions under concurrent requests.
- **Decision:** Commit inventory changes in [`backend/app/routes/delivery.py`](../backend/app/routes/delivery.py) using SQLAlchemy SQL-level arithmetic (`usable_stock=Product.usable_stock + usable_delta`, `damaged_stock=Product.damaged_stock + entry.damaged`) inside a single transaction alongside the `StockMovement` insert.
- **Consequences:** Concurrent commits remain linearizable in PostgreSQL without lost updates.

---

## ADR-004: UUID `idempotency_key` + `UNIQUE` Constraint on Confirmation

- **Context:** On mobile touchscreens or unstable kirana shop Wi-Fi, double-tapping **Confirm & Save** or retrying a timed-out HTTP request would otherwise double-count a morning delivery.
- **Decision:** Generate a fresh UUID `idempotency_key` when initializing `PendingDraft`, combine it with a UI `isConfirmingRef` guard, enforce `unique=True` on `stock_movements.idempotency_key`, and return `status="duplicate"` with current stock totals if the key already exists.
- **Consequences:** Replayed confirm requests are provably safe and verified live against PostgreSQL.

---

## ADR-005: Separate `usable_stock` and `damaged_stock` Columns

- **Context:** Collapsing delivery quantities into one net stock integer erases accountability for leaking milk packets or torn flour bags that must be claimed back from suppliers.
- **Decision:** Model `usable_stock` and `damaged_stock` as separate first-class columns on `products` (and record `received`, `damaged`, `usable_delta` on `stock_movements`), surfaced distinctly as **Usable** vs **Return** in [`StockView.tsx`](../frontend/src/components/StockView.tsx).
- **Consequences:** Shopkeepers track sellable shelf balance accurately while keeping supplier return totals visible for settlement.
