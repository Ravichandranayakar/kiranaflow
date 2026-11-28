# 01 — Problem & Solution

## 1. The Problem

Small Indian kirana shopkeepers receive morning supplier deliveries (crates of milk, oil, atta, pulses, staples) **while simultaneously serving walk-in customers**. During unloading, the shopkeeper must:

1. Check each item delivered against what arrived on the crate/bag.
2. Separate **usable stock** (sellable on the shelf) from **damaged/leaking items** (claims to return to the distributor).
3. Record quantities accurately before moving to the next crate or customer.

### Why Traditional Apps & Notebooks Fail Here

- **Physical bottleneck:** Hands are carrying crates or weighing bags; stopping to unlock a phone, pick a SKU from dropdowns, and type quantities interrupts customer service.
- **Deferred entry errors:** Scribbling on paper or trying to enter stock after the rush leads to missed entries, forgotten damaged-packet claims, and inaccurate reorder decisions.
- **Language mismatch:** Shopkeepers naturally code-switch across **English, Hindi, and Kannada** (e.g., `"24 milk packets bandide, 2 odada ide"` or `"10 cheeni 2 kharab"`), correct themselves mid-sentence (`"10 fortune oil illa illa 12 packets 1 leaky"`), and use phonetic/colloquial names (`haalu`, `doodh`, `sakre`, `daal`).

---

## 2. The Target User

- **Primary user:** Owners and counter staff at small Indian neighbourhood grocery stores (kirana stores) operating in mixed-language environments.
- **Usage frequency:** Multiple times per week during early-morning dairy/produce drops and distributor deliveries.
- **Environment:** Noisy shop floor, intermittent hands-free focus, mobile-first screen budget (`max-w-[440px]`).

---

## 3. Why Voice Comes First

Voice is the primary input modality because **receiving stock is a physical, eyes-busy, hands-busy task**. Instead of turning intake into form navigation:

1. **Tap once to speak:** Push-to-Talk mic opens only on deliberate tap and auto-stops after `1.5s` of silence once new speech ends (preventing continuous background eavesdropping).
2. **Confirm-before-write safety:** Spoken input **never** mutates inventory directly. Every parsed delivery enters `AWAITING_CONFIRMATION`, reads the numbers back aloud (and visually), and waits for explicit `"Confirm"`, `"Haan"`, `"Sari"`, or button tap.
3. **Graceful non-voice fallback:** Where Chrome Web Speech is unavailable or background noise blocks speech, **Or type instead** and one-tap **Try a test case** chips drive the exact same backend pipeline.

---

## 4. The Solution Architecture (`Speak` → `Stock` → `History`)

KiranaFlow organizes the workflow into three bottom-navigated tabs:

| Tab | Role in Kirana Store | Underlying Guarantee |
|-----|----------------------|----------------------|
| **Speak** | Hands-free delivery intake, clarification, read-back, confirm/cancel | Backend state machine (`POST /api/voice/parse`) echoes full `PendingDraft`; nothing saves until confirmed |
| **Stock** | Live shelf view distinguishing `Usable` vs `Return` (damaged), low-stock alerts, and **Copy WhatsApp Reorder Draft** | Atomic SQL increments on `products`; never places automated supplier orders |
| **History** | Immutable delivery audit trail showing raw transcript, language, source (`voice`/`text`/`demo`), and correction flag | Append-only `stock_movements` table protected by unique `idempotency_key` |

---

## 5. Honest Scope Boundaries (MVP)

To maximize stability and zero-setup judge reproducibility in Round 2:

- **Included:** 15 pre-seeded Indian grocery SKUs with EN/HI/KN phonetic aliases (`backend/app/services/seed.py`), deterministic rule-based voice/text parser (`parser.py`), multi-turn clarification, 3-language UI + read-back (`en`, `hi`, `kn`), atomic PostgreSQL persistence, idempotent confirmations, and clipboard WhatsApp low-stock reorder draft.
- **Intentionally Deferred (Out of MVP Scope):** User authentication/multi-tenant store accounts, POS customer billing, custom user SKU CRUD UI, automated supplier order dispatch, spoken `"what is running low?"` voice command (handled visually on the **Stock** tab instead), and mandatory cloud LLM keys (`LLM_API_KEY` is optional and empty by default).
