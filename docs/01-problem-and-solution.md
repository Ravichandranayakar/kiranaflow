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

1. **Tap once to speak (+ hands-free confirm loop):** Push-to-Talk mic opens on tap and auto-stops after `1.0s` of post-speech silence (or closes cleanly after `7s` if no voice is heard). When started by voice, once KiranaFlow finishes speaking its confirmation read-back or clarification prompt (`350ms` after speech ends), the mic **automatically re-opens once** (plus a thumb-zone **Speak “OK / Confirm” or Edit** button right on the card) so a busy shopkeeper can say `"ok"`, `"ya confirm"`, `"haan"`, `"houdu"`, `"sari"`, or a spoken correction without touching any button.
2. **Casual short names + confirm-before-write safety:** Shopkeepers can say natural short names (`"5 magi"`, `"10 parle"`, `"5 oil"`, `"10 atta"`) without reciting weights like `"70g"` or `"500ml"`. Voice input **never** mutates inventory directly: ambiguous sizes prompt once, multi-item prompts support `"both"`, every parsed delivery enters `AWAITING_CONFIRMATION` (updating live across `E / हि / ಕ` even if switched midway), and writes commit only on explicit confirmation.
3. **Graceful non-voice fallback:** Where a microphone is unavailable, muted, or blocked by counter noise, **Or type instead** and 6 one-tap **Try a test case** chips drive the exact same backend pipeline.

---

## 4. The Solution Architecture (`Speak` → `Stock` → `History`)

KiranaFlow organizes the workflow into three bottom-navigated tabs:

| Tab | Role in Kirana Store | Underlying Guarantee |
|-----|----------------------|----------------------|
| **Speak** | Hands-free single- or multi-item delivery intake, short/fuzzy brand matching, `"both"` resolution, clarification, live `E/हि/ಕ` read-back, and voice confirm/cancel | Backend state machine (`POST /api/voice/intake` & `/api/voice/parse`) echoes full `PendingDraft`; nothing saves until confirmed |
| **Stock** | Live shelf view distinguishing `Usable` vs `Return` (damaged), `+` / `-` manual stock updates, `Add Item` / delete SKU management, low-stock alerts, and **Copy WhatsApp Reorder Draft** | Atomic SQL increments on `products`; never allows negative stock or places automated supplier orders |
| **History** | Immutable delivery audit trail showing raw transcript, language, source (`voice`/`text`/`demo`/`manual`), and correction flag | Append-only `stock_movements` table protected by unique `idempotency_key` |

---

## 5. Honest Scope Boundaries (MVP)

To maximize stability and zero-setup judge reproducibility in Round 2:

- **Included:** Cross-browser `MediaRecorder` capture + offline `faster-whisper` transcription (`base`, INT8), `350ms` post-readback hands-free follow-up mic + inline card mic button, deterministic 3-tier product matcher (exact aliases + casual brand words + speech-spelling fuzzy fallback), multi-item/`"both"` batch confirmation, decoupled `E / हि / ಕ` UI + live midway read-back translation, 15 pre-seeded Indian grocery SKUs + explicit **Add Item** / delete SKU and manual `+`/`-` adjustments, atomic PostgreSQL persistence, idempotent confirmations, and clipboard WhatsApp low-stock reorder drafts.
- **Intentionally Deferred (Finale Roadmap):** Dedicated Indian regional ASR + native Devanagari/Kannada script parsing for pure regional speech, bulk 500-SKU FMCG master onboarding / invoice OCR photo import, inline new-SKU quick-create from unknown prompts, user authentication/multi-tenant store accounts, POS customer billing, automated supplier order dispatch, and mandatory cloud LLM keys (`LLM_API_KEY` is optional and empty by default).
