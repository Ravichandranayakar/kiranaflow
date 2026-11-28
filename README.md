# KiranaFlow

**Voice-first delivery & inventory assistant for Indian kirana stores.**

Built for the Scaler × Wispr Flow Hackathon (Round 2).

KiranaFlow lets shopkeepers log supplier deliveries hands-free in **English, Hindi, Kannada, Hinglish, and Kanglish** while unloading crates—separating **usable shelf stock** from **damaged stock for supplier return**, catching ambiguous quantities (`14` vs `40`) and mid-sentence self-corrections (`illa illa`), and **never updating inventory until explicitly confirmed**.

---

## Quick Start

```bash
git clone https://github.com/Ravichandranayakar/kiranaflow.git
cd kiranaflow

# Start PostgreSQL, FastAPI backend, and Nginx frontend (zero API keys needed)
docker compose up --build
```

- **Frontend App:** [http://localhost:8080](http://localhost:8080) *(if port `8080` is occupied, run `FRONTEND_PORT=8085 docker compose up --build`)*
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Health Check:** [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **Local Vite Dev (optional):** `cd frontend && npm install && npm run dev` → [http://localhost:5173](http://localhost:5173)

> **Voice input note:** Browser speech recognition uses the Web Speech API (`en-IN` / `hi-IN` / `kn-IN`), which requires Google Chrome + an active internet connection for speech-to-text. Every screen also works offline/without a mic via **Or type instead** and the 5 one-tap **Try a test case** chips.

---

## What It Solves in Practice

1. **Speak / Type (`Speak` tab):** Tap the mic dial and say `"24 milk packets bandide 2 odada ide"`. Auto-stops after 1.5s of silence and parses product, received count, damaged count, usable delta, and unit.
2. **Safety Guards (`NEEDS_CLARIFICATION`):** Catches `14` vs `40` teen/tens confusion, missing damage count, unknown SKUs, and mid-sentence self-corrections (`"10 fortune oil illa illa 12 packets 1 leaky"` → `12` received, `1` damaged).
3. **Explicit Confirmation (`AWAITING_CONFIRMATION`):** Reads back total usable vs damaged stock in the active language (`E / हि / ಕ`). Nothing writes to PostgreSQL until the user taps **Confirm & Save** or speaks `"Confirm"`, `"Haan"`, or `"Sari"`.
4. **Live Shelf & Audit Trail (`Stock` & `History` tabs):** Updates `usable_stock` and `damaged_stock` atomically, generates a copy-ready **WhatsApp Reorder Draft** for low-stock SKUs, and logs the raw transcript in `stock_movements`.

---

## Documentation Pack (`docs/`)

| Document | Scope |
|----------|-------|
| [01 — Problem & Solution](docs/01-problem-and-solution.md) | Kirana pain point, voice-first rationale, MVP scope boundaries |
| [02 — Software Requirements (SRS)](docs/02-srs.md) | 12 functional + 6 non-functional requirements traced to code |
| [03 — Use Cases](docs/03-use-cases.md) | Use-case diagram & UC-01..UC-11 workflows |
| [04 — System Architecture](docs/04-architecture.md) | Component, Docker deployment, and Level-0 DFD Mermaid diagrams |
| [05 — Sequence Diagrams](docs/05-sequences.md) | Multi-turn `/api/voice/parse` loop & atomic `/api/deliveries/confirm` |
| [06 — State Machine & Parser](docs/06-activity-state-machine.md) | Frontend state diagram, parser activity flowchart, linguistic tables |
| [07 — Data Model](docs/07-data-model.md) | PostgreSQL ER diagram (`db_models.py`) & 15-SKU seed catalogue |
| [08 — API Reference](docs/08-api-reference.md) | Verified live JSON payloads for all 5 endpoints |
| [09 — Test Plan & Results](docs/09-test-plan-and-results.md) | `33 passed` pytest evidence, TypeScript check & idempotency proof |
| [10 — User Guide](docs/10-user-guide.md) | Shopkeeper workflow, language switcher, mic/text modes & settings |
| [11 — Architecture Decisions (ADRs)](docs/11-decisions.md) | 5 key engineering trade-offs & implementation proofs |

---

## Project Structure

```text
kiranaflow/
├── docker-compose.yml            # PostgreSQL 16 + FastAPI + Nginx startup
├── .env.example                  # Optional environment configuration template
├── README.md
├── docs/                         # Engineering documentation & Mermaid diagrams
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                   # FastAPI entrypoint & idempotent startup seeding
│   ├── tests/
│   │   └── test_parser.py        # 33 standalone parser unit tests
│   └── app/
│       ├── config.py             # Environment settings
│       ├── db.py                 # SQLAlchemy engine, session & health check
│       ├── models/
│       │   ├── db_models.py      # Product, ProductAlias, StockMovement
│       │   └── schemas.py        # Pydantic v2 API contracts
│       ├── routes/
│       │   ├── voice.py          # POST /api/voice/parse
│       │   └── delivery.py       # POST /api/deliveries/confirm, GET /api/stock*
│       └── services/
│           ├── seed.py           # 15 pre-seeded Indian grocery SKUs + EN/HI/KN aliases
│           ├── catalogue_service.py
│           └── parser.py         # Deterministic multilingual parser & state rules
└── frontend/
    ├── Dockerfile                # Multi-stage Node 20 build -> Nginx runtime
    ├── nginx.conf                # Static SPA + /api/ reverse proxy to backend:8000
    ├── package.json
    └── src/
        ├── App.tsx               # 3-tab mobile-first layout + ErrorBoundary
        ├── hooks/useDeliveryFlow.ts
        ├── services/
        │   ├── api.ts            # Typed fetch client (/api/*)
        │   └── speech.ts         # Web Speech API + Web Audio feedback
        ├── i18n/translations.ts  # Full EN / HI / KN UI translations
        └── components/           # Header, HeroBanner, PendingReceiptCard, MicDial, StockView, HistoryView
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI 0.115.6, Pydantic v2, SQLAlchemy 2.0, Uvicorn |
| Database | PostgreSQL 16 (`psycopg` v3 binary driver) |
| Frontend | React 18, TypeScript 5.6, Vite 6, Tailwind CSS 3, Lucide Icons |
| Voice Input | Browser Web Speech API (`en-IN`, `hi-IN`, `kn-IN`) + WebRTC mic constraints |
| Voice Output | Browser Web Speech Synthesis + Web Audio feedback chimes |
| Runtime | Docker & Docker Compose (`db`, `backend`, `frontend` via Nginx) |
