# 03 — Use Cases

## 1. System Use-Case Diagram

Standard GitHub Mermaid renders actors and system boundary cleanly via `flowchart LR`:

```mermaid
flowchart LR
    Shopkeeper(["Shopkeeper (Voice / Touch)"])
    Supplier(["Supplier (Indirect)"])
    Parser[["Deterministic Parser & API"]]
    DB[("PostgreSQL Ledger")]

    subgraph KiranaFlow["KiranaFlow Mobile Web App"]
        UC01(["UC-01: Switch Language EN/HI/KN"])
        UC02(["UC-02: Speak or Type Delivery"])
        UC03(["UC-03: Resolve Clarification"])
        UC04(["UC-04: Review Read-Back & Edit"])
        UC05(["UC-05: Confirm or Cancel Draft"])
        UC06(["UC-06: Commit Stock Atomically"])
        UC07(["UC-07: View Usable & Damaged Stock"])
        UC08(["UC-08: Copy WhatsApp Reorder Draft"])
        UC09(["UC-09: View Delivery Audit History"])
        UC10(["UC-10: Toggle TTS & Check Health"])
    end

    Shopkeeper --> UC01
    Shopkeeper --> UC02
    Shopkeeper --> UC03
    Shopkeeper --> UC04
    Shopkeeper --> UC05
    Shopkeeper --> UC07
    Shopkeeper --> UC08
    Shopkeeper --> UC09
    Shopkeeper --> UC10

    UC02 --> Parser
    UC03 --> Parser
    UC04 --> Parser
    UC05 --> UC06
    UC06 --> DB
    UC07 --> DB
    UC09 --> DB
    UC07 -.->|"Damaged count tracked for return"| Supplier
    UC08 -.->|"Clipboard message sent manually"| Supplier
```

---

## 2. Core Use-Case Specifications

| ID | Use Case | Trigger & Primary Flow | Verification |
|----|----------|------------------------|--------------|
| **UC-01** | Switch Language (Anytime) | Shopkeeper taps `E`, `हि`, or `ಕ` in `Header` — even midway during review. All UI labels (`translations.ts`), badges, units, card read-backs, clarification prompts, and spoken TTS output update immediately while still accepting EN/HI/KN mixed input. | Live header toggle |
| **UC-02** | Speak / Type Delivery | Tap `MicDial` (requests WebRTC `noiseSuppression`, `echoCancellation`, `autoGainControl` via standard `MediaRecorder`), speak casually (`"5 magi"`, `"10 atta"`, `"24 milk packets bandide 2 odada ide"`), or tap **Or type instead** / `ExampleStrip` (6 chips). Web Audio VAD stops `1.0s` after speech ends (`7s` no-voice cutoff) and sends audio to `POST /api/voice/intake`. | `useDeliveryFlow.ts` |
| **UC-03** | Resolve Ambiguity / "Both" | When `POST /api/voice/parse` returns `status="clarify"` or `"unknown"`, UI renders `PendingReceiptCard` options: `teen_tens` 2-button grid (`14` vs `40`), candidate cards + **Select All / Both** (`variant` or saying `"both"`), quick quantity pills (`received_qty`), quick pills `0..5` (`damaged_qty`), or catalogue chips (`unknown_sku`). | `test_parser.py` |
| **UC-04** | Review Read-Back & Hands-Free Edit | When `status="complete"`, app highlights `+usable` in chartreuse, speaks localized `readback_text` via `speechSynthesis`, and on voice turns **automatically re-opens the mic (`350ms` after speech ends)** alongside an inline **Speak “OK / Confirm” or Edit** button so the user can speak corrections (`"28 packets and 3 damaged"`, `"maggi 12"`) or tap **Edit details**. | `PendingReceiptCard.tsx` |
| **UC-05** | Confirm or Cancel (Hands-Free or Tap) | Tap **Confirm & Save** or speak `"OK"`, `"Ya confirm"`, `"Confirm"`, `"Haan"`, `"Houdu"`, or `"Sari"` during the active review. Cancel clears `PendingDraft` back to `IDLE`. Spoken confirm/cancel is ignored outside `awaiting_confirmation`. | `test_confirm_only_when_awaiting` |
| **UC-06** | Atomic Commit | Frontend sends `POST /api/deliveries/confirm` (or `/confirm-batch` for multi-item deliveries) with UUID `idempotency_key`. Backend updates `products` atomically and appends `stock_movements`, playing Web Audio success chime and showing **Committed** receipt. | Live DB + duplicate test |
| **UC-07** | Manage Stock & Return Claims | Open **Stock** tab; filter `All`, `Low`, or `Damaged`. Each row separates sellable **Usable** count from **Return** (`damaged_stock`), and supports manual `+`/`-` adjustments (`POST /api/stock/adjust`) plus explicit **Add Item** / delete SKU (`POST/DELETE /api/stock/products`). | `StockView.tsx` |
| **UC-08** | Draft WhatsApp Reorder | When `low_stock_count > 0`, tapping **Copy WhatsApp Reorder Draft** copies formatted item list (`- Name (only X left)`) to clipboard. | `StockView.tsx` |
| **UC-09** | Audit Movement History | Open **History** tab to inspect chronological entries with `raw_transcript`, `lang`, `source`, `+usable_delta`, `damaged`, and `CORRECTED` badge. | `HistoryView.tsx` |
| **UC-10** | Settings & Diagnostics | Tap gear icon in `Header` to mute/unmute spoken TTS and inspect `/api/health` (`database`, `llm_parser`, optional key field). | `SettingsModal.tsx` |
