# 10 — User Guide

## 1. Getting Started

1. Start KiranaFlow:
   ```bash
   docker compose up --build
   ```
2. Open [http://localhost:8080](http://localhost:8080) in **Google Chrome** (or `http://localhost:8085` if `FRONTEND_PORT=8085` was used).
3. Select your preferred display & read-back language in the top-right header:
   - **`E`** — English (`en-IN`)
   - **`हि`** — Hindi (`hi-IN`)
   - **`ಕ`** — Kannada (`kn-IN`)

---

## 2. Tab 1 — `Speak` (Hands-Free Delivery Intake)

### Recording by Voice

1. Tap the central circular **Tap to Speak** dial. A short start chime plays and Chrome asks for mic permission on first run.
2. Speak naturally in English, Hindi, Kannada, Hinglish, or Kanglish—for example:
   - `"24 milk packets bandide 2 odada ide"`
   - `"10 cheeni 2 kharab"`
   - `"10 fortune oil illa illa 12 packets 1 leaky"`
3. **Automatic end detection:** Pause for `1.5 seconds` after finishing your sentence—KiranaFlow automatically stops the mic and submits to the backend (or tap the square stop hub manually). If no audio reaches Chrome within `4 seconds`, it prompts you and opens text fallback.

### Using Text Fallback or Test Case Chips

- Tap **Or type instead** below the mic dial to type any entry manually (useful in noisy environments or non-Chrome browsers).
- Or tap any chip under **Try a test case** (`Normal entry`, `14 or 40?`, `Self-correction`, `Unknown product`, `Hindi sugar`).

### Handling Clarification Cards

If anything is ambiguous, KiranaFlow pauses before saving and displays a focused **Quick Clarification** card:
- **`14 or 40?` (`teen_tens`):** Tap `[14]` or `[40]`, or speak the number.
- **Multiple brand matches (`variant`):** Tap the exact SKU row.
- **Missing damage count (`damaged_qty`):** Tap `0 (None)` or `1`–`5`, or speak the number.
- **Unknown product (`unknown_sku`):** Tap one of the quick catalogue chips or restate the brand name.

### Confirming Before Anything Saves

When ready, the card highlights `+usable` units in lime green and speaks a localized read-back aloud:
- **Save:** Tap **Confirm & Save**, or tap the mic and say `"Confirm"`, `"Haan"`, or `"Sari"`.
- **Edit:** Tap **Edit details** to adjust `RECEIVED` and `DAMAGED` numbers directly, or speak a correction (e.g., `"actually 3 packets are damaged"`).
- **Discard:** Tap **Cancel entry** or say `"Cancel"` / `"Beda"`.

---

## 3. Tab 2 — `Stock` (Shelf Balance & Reorders)

- Filter inventory with **All**, **Low**, or **Damaged**.
- Each SKU card displays sellable **Usable** quantity alongside **Return** (`damaged_stock`) kept separate for distributor claims.
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
