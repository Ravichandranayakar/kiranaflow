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
| **UC-01** | Switch Language | Shopkeeper taps `E`, `हि`, or `ಕ` in `Header`. UI copy (`translations.ts`), recognition locale (`en-IN`/`hi-IN`/`kn-IN`), and future parser read-backs update immediately. | Live header toggle |
| **UC-02** | Speak / Type Delivery | Tap `MicDial` (requests WebRTC `noiseSuppression`, `echoCancellation`, `autoGainControl`), speak phrase, or tap **Or type instead** / `ExampleStrip`. Auto-submits after `1.5s` of silence on new speech (or `4s` no-speech warning). | `useDeliveryFlow.ts` |
| **UC-03** | Resolve Ambiguity | When `POST /api/voice/parse` returns `status="clarify"` or `"unknown"`, UI renders `PendingReceiptCard` options: `teen_tens` 2-button grid (`14` vs `40`), candidate cards (`variant`), quick pills `0..5` (`damaged_qty`), or 8-SKU chips (`unknown_sku`). | `test_parser.py` |
| **UC-04** | Review Read-Back & Edit | When `status="complete"`, app highlights `+usable` in chartreuse, speaks `readback_text` via `speechSynthesis`, and allows spoken correction (`"3 are damaged"`) or **Edit details** numeric override. | `PendingReceiptCard.tsx` |
| **UC-05** | Confirm or Cancel | Tap **Confirm & Save** (or speak `"Confirm"`, `"Haan"`, `"Sari"`). Cancel clears `PendingDraft` back to `IDLE`. Spoken confirm/cancel is ignored outside `awaiting_confirmation`. | `test_confirm_only_when_awaiting` |
| **UC-06** | Atomic Commit | Frontend sends `POST /api/deliveries/confirm` with UUID `idempotency_key`. Backend updates `products` atomically and appends `stock_movements`, playing Web Audio success chime and showing **Committed** receipt. | Live DB + duplicate test |
| **UC-07** | View Stock & Return Claims | Open **Stock** tab; filter `All`, `Low`, or `Damaged`. Each row separates sellable **Usable** count from **Return** (`damaged_stock`) owed back by the supplier. | `StockView.tsx` |
| **UC-08** | Draft WhatsApp Reorder | When `low_stock_count > 0`, tapping **Copy WhatsApp Reorder Draft** copies formatted item list (`- Name (only X left)`) to clipboard. | `StockView.tsx` |
| **UC-09** | Audit Movement History | Open **History** tab to inspect chronological entries with `raw_transcript`, `lang`, `source`, `+usable_delta`, `damaged`, and `CORRECTED` badge. | `HistoryView.tsx` |
| **UC-10** | Settings & Diagnostics | Tap gear icon in `Header` to mute/unmute spoken TTS and inspect `/api/health` (`database`, `llm_parser`, optional key field). | `SettingsModal.tsx` |
