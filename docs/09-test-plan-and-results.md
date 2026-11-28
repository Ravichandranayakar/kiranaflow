# 09 — Test Plan & Verification Results

## 1. Automated Unit Suite (`backend/tests/test_parser.py`)

`parser.py` is tested as pure Python logic without requiring Docker or PostgreSQL.

**Command & Observed Output:**

```text
> python -m pytest backend/tests/ -v
platform win32 -- Python 3.12.3, pytest-8.2.2, pluggy-1.5.0
collected 37 items

============================= 37 passed in 0.33s ==============================
```

### Test Coverage Matrix (37 / 37 Passed)

| Test Class | Count | Verified Behaviors |
|------------|-------|--------------------|
| `TestBasicParsing` | 7 | English/Hindi/Kannada SKU aliases (`milk`, `doodh`, `haalu`), damage keywords (`damaged`, `odada`, `kharab`), default `damaged=0` |
| `TestSelfCorrection` | 3 | Mid-sentence correction markers (`illa illa`, `no no`, `actually`) override prior numbers while retaining full-sentence product match |
| `TestClarification` | 5 | Variant check, missing damage count probe, `unknown_sku`, `teen_tens` detection (`14` → `[14, 40]`), safe numbers bypass |
| `TestClarificationMerge` | 3 | Single `_merge_clarification()` resolves `teen_tens` (`"40"`), `damaged_qty` (`"3"`), and `"none"` (`damaged=0`) |
| `TestConfirmCancel` | 6 | Spoken confirm in EN (`confirm`), HI (`haan`), KN (`sari`), `cancel`, live damage correction while awaiting, rejecting `confirm` outside `awaiting_confirmation` |
| `TestCodeSwitching` | 3 | Hinglish (`"24 milk packets aaya 2 kharab"`), Kanglish (`"24 milk packets bandide 2 packets odada ide"`), complex `illa illa` + `leaky` |
| `TestEdgeCases` | 6 | Empty transcript error, localized read-backs (EN/HI/KN), UUID `idempotency_key` presence, `damaged > received` guard |
| `TestMultiItemParsing` | 4 | Multi-item parsing (`"1 kg onion and 4 kg daal"`), multi-item with `teen_tens` clarify (`"14 milk packets and 4 kg daal"`), single-item comma-damage guard, Whisper punctuation tolerance (`"4 kg daal."`, `"Confirm."`) |

---

## 2. TypeScript & Frontend Verification

**Command & Observed Output:**

```text
> cd frontend && npx tsc -b --noEmit
EXIT:0
```

- Verified zero `any` types (`frontend/src/types/api.ts`) and valid React 18 production build inside the multi-stage Docker image (`frontend/Dockerfile`).

---

## 3. Live Docker, PostgreSQL & Idempotency Verification

Verified against running containers (`kiranaflow-db-1`, `kiranaflow-backend-1`, `kiranaflow-frontend-1`):

| Check | Endpoint / Method | Verified Outcome |
|-------|-------------------|------------------|
| Health via Nginx proxy | `GET http://localhost:8085/api/health` | `{"status":"healthy","database":"connected","llm_parser":"disabled (deterministic parser active)","default_language":"en"}` |
| Live text parse latency | `POST http://localhost:8085/api/voice/parse` (`"24 milk packets bandide 2 odada ide"`) | `98.2 ms` round-trip -> `Nandini Toned Milk 500ml` (`24` received, `2` damaged, `22` usable) |
| Live offline Whisper intake | `POST http://localhost:8085/api/voice/intake` (spoken WAV `"24 milk packets received, 2 damaged"`) | `HTTP 200` in `1.94 s` first call, `1.10 s`–`1.14 s` warm follow-ups via offline `faster-whisper` |
| Live DB commit & rollback test | `confirm_delivery()` inside `SessionLocal()` | First call returned `"status": "committed"`, `movement_id: 5`, `usable_stock: 84`, `damaged_stock: 4` |
| Idempotent retry (same key) | Second `confirm_delivery()` with same `idempotency_key` | Returned `"status": "duplicate"`, `movement_id: 5`, with `usable_stock` frozen at `84` and `damaged_stock` frozen at `4` (zero double-counting) |
| Live API duplicate protection | `POST /api/deliveries/confirm` replaying existing DB key `3e6a0d15-55f9-4da2-999a-83c01ff63c55` | Returned `"status": "duplicate"`, `movement_id: 1`, `usable_stock: 62`, `damaged_stock: 2` |
| Stock & SKU CRUD | `GET /api/stock`, `POST/DELETE /api/stock/products`, `POST /api/stock/adjust` | Returned 15 seeded SKUs; verified custom add (`409` on duplicate), `+`/`-` adjust (`400` negative guard), and clean delete |
| Docker idle footprint | `docker stats --no-stream` | Backend `0.18%` CPU (`487.4 MiB` RAM incl. Whisper weights), Frontend `0.00%` CPU (`10.59 MiB`), Postgres `0.00%` CPU (`23.21 MiB`) |

---

## 4. Known Scope Notes & Edge Cases

- `pytest` runs cleanly on the host Python environment (`backend/tests/test_parser.py`); it is intentionally omitted from the slim runtime container (`backend/requirements.txt`).
- When a spoken phrase lists an unlisted item (e.g., `"10 packets amul butter"` or `"1 kg of gold"`), `parser.py` returns `status="unknown"` (`question_kind="unknown_sku"`) and preserves spoken quantity while waiting for SKU selection—never creating fake catalogue rows automatically. Custom SKUs can be intentionally added from the **Stock** tab (**Add Item**).
- Voice recording uses standard browser `MediaRecorder` + Web Audio adaptive VAD with offline `faster-whisper` transcription, so voice intake runs across Chrome, Brave, Firefox, and Edge without external keys; **Or type instead** and the 6 test chips provide full keyboard/touch fallback.
