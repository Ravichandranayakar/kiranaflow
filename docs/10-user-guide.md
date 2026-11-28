# 10 — User Guide

## 1. Getting Started

1. Start KiranaFlow:
   ```bash
   docker compose up --build
   ```
2. Open [http://localhost:8080](http://localhost:8080) (or `http://localhost:8085` if `FRONTEND_PORT=8085` was used) in **Chrome, Brave, Firefox, or Edge**.
3. Select your preferred display & read-back language in the top-right header:
   - **`E`** — English (`en-IN`)
   - **`हि`** — Hindi (`hi-IN`)
   - **`ಕ`** — Kannada (`kn-IN`)

---

## 2. Tab 1 — `Speak` (Hands-Free Delivery Intake)

### Recording by Voice

1. Tap the central circular **Tap to Speak** dial. A short start chime plays and the browser requests microphone permission on first run.
2. Speak naturally in English, Hindi, Kannada, Hinglish, or Kanglish—casual short brand names work too without reciting weights (`"70g"`/`"500ml"`):
   - `"24 milk packets bandide 2 odada ide"`
   - `"5 magi"` / `"10 parle"` / `"5 oil"` / `"10 atta"`
   - `"10 cheeni 2 kharab"`
   - `"10 fortune oil illa illa 12 packets 1 leaky"`
   - `"1 kg onion and 4 kg daal"`
3. **Automatic end detection & hands-free follow-up:** Pause for `1.0 second` after finishing your sentence—KiranaFlow automatically stops recording and sends audio in one step to `/api/voice/intake`. After KiranaFlow finishes speaking its confirmation read-back (`350ms`), the mic automatically re-opens once so you can stay completely hands-free, or use the inline **Speak “OK / Confirm” or Edit** button directly on the card.
4. **Decoupled language toggle (`E` / `हि` / `ಕ`):** Switch UI text, card badges, units, and read-backs anytime (even midway through a review card) without restricting mixed Hinglish/Kanglish spoken input.

### Using Text Fallback or Test Case Chips

- Tap **Or type instead** below the mic dial to type any entry manually in noisy environments.
- Or tap any chip under **Try a test case** (`Normal entry`, `14 or 40?`, `Self-correction`, `Unknown product`, `Hindi sugar`, `2 items at once`).

### Handling Clarification Cards

If anything is ambiguous, KiranaFlow pauses before saving and displays a focused **Quick Clarification** card:
- **`14 or 40?` (`teen_tens`):** Tap `[14]` or `[40]`, or speak the number.
- **Multiple matches (`variant`):** Tap one exact SKU row, tap **Select All / Both**, or say `"both"` to queue multiple items (`received_qty` quick pills guide missing counts).
- **Missing damage count (`damaged_qty`):** Tap `0 (None)` or `1`–`5`, or speak the number.
- **Unknown product (`unknown_sku`):** Tap one of the quick catalogue chips, restate the brand name, or add the SKU explicitly in **Stock -> `+ Add Item`**.

### Confirming Before Anything Saves

When ready, the card highlights `+usable` units in lime green and speaks a localized read-back aloud:
- **Save:** Simply say `"OK"`, `"Ya confirm"`, `"Confirm"`, `"Haan"`, `"Houdu"`, or `"Sari"` into the hands-free follow-up mic (or tap **Confirm & Save** / **Speak “OK / Confirm” or Edit**).
- **Edit:** Say single or dual changes directly (`"28 packets and 3 damaged"` or `"maggi 12"` in a batch), or tap **Edit details**.
- **Discard:** Say `"Cancel"` / `"Beda"` or tap **Cancel entry**.

---

## 3. Tab 2 — `Stock` (Shelf Balance, Adjustments & Reorders)

- Filter inventory with **All**, **Low**, or **Damaged**.
- Each SKU card displays sellable **Usable** quantity alongside **Return** (`damaged_stock`) kept separate for distributor claims.
- Use **Adjust (`+/-`)** on any card for manual opening-stock edits or wastage/sales deductions (guarded against negative stock), **Add Item** to explicitly create a new product with spoken aliases, or the trash action to remove unused SKUs.
- Items below `min_threshold` show an amber `Low (<N)` badge.
- Tap **Copy WhatsApp Reorder Draft** to copy a ready-to-send supplier list (`Namaste, please send stock for: ...`) to your clipboard—KiranaFlow never dispatches orders automatically.

---

## 4. Tab 3 — `History` (Audit Log)

Inspect every committed delivery ordered newest-first, including:
- Product name and server timestamp
- `+usable` delta and `dmg` count
- Verbatim `raw_transcript` in quotes
- Language tag (`en`/`hi`/`kn`), input source badge (`voice`/`text`/`demo`), and `CORRECTED` pill if modified prior to confirm.

---

## 5. Settings Modal (Gear Icon)

- **Spoken Read-Back (TTS):** Toggle between **Active** and **Muted** (on-screen text read-back remains visible).
- **Key Status:** Confirms live `/api/health` parser status (`disabled (deterministic parser active)`)—no external API key is needed to operate.
