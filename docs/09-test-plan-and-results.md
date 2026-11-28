# 09 — Test Plan & Verification Results

## 1. Automated Unit Suite (`backend/tests/test_parser.py`)

`parser.py` is tested as pure Python logic without requiring Docker or PostgreSQL.

**Command & Observed Output:**

```text
> python -m pytest backend/tests/ -v
platform win32 -- Python 3.12.3, pytest-8.2.2, pluggy-1.5.0
collected 38 items

============================= 38 passed in 0.36s ==============================
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
| Live DB commit & rollback test | `confirm_delivery()` inside `SessionLocal()` | First call returned `"status": "committed"`, `movement_id: 5`, `usable_stock: 84`, `damaged_stock: 4` |
| Idempotent retry (same key) | Second `confirm_delivery()` with same `idempotency_key` | Returned `"status": "duplicate"`, `movement_id: 5`, with `usable_stock` frozen at `84` and `damaged_stock` frozen at `4` (zero double-counting) |
| Live API duplicate protection | `POST /api/deliveries/confirm` replaying existing DB key `3e6a0d15-55f9-4da2-999a-83c01ff63c55` | Returned `"status": "duplicate"`, `movement_id: 1`, `usable_stock: 62`, `damaged_stock: 2` |
| Stock & Movements ledger | `GET /api/stock` & `GET /api/stock/movements` | Returned 15 seeded SKUs (`low_stock_count: 13`) and persisted audit records (`id: 1..4`) |

---

## 4. Known Scope Notes & Edge Cases

- `pytest` runs cleanly on the host Python environment (`backend/tests/test_parser.py`); it is intentionally omitted from the slim runtime container (`backend/requirements.txt`).
- When a spoken phrase lists an unlisted item (e.g., `"10 packets amul butter"`), `parser.py` returns `status="unknown"` (`question_kind="unknown_sku"`) and preserves spoken quantity while waiting for SKU selection—never creating fake catalogue rows automatically.
- Browser Web Speech recognition (`SpeechRecognition`) requires Chrome + network access to Chrome's speech service; non-Chrome browsers automatically surface the **Or type instead** keyboard box.
