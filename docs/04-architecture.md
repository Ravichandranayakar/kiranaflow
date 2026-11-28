# 04 — System Architecture & Deployment

## 1. System Architecture

KiranaFlow uses a three-tier client–server architecture where **all linguistic interpretation and draft state merging live on the Python backend**, leaving React strictly as a typed voice/touch presentation layer. Zero external LLM API keys are required.

```mermaid
flowchart LR
    subgraph Client["Browser (Chrome / Brave / Firefox / Edge SPA)"]
        UI["React 18 + Tailwind UI\n(Speak / Stock / History)"]
        Hook["useDeliveryFlow.ts\n(State Machine & Audio VAD)"]
        WebSpeech["MediaRecorder + SpeechSynthesis\n(Cross-Browser Audio & TTS)"]
        ApiClient["services/api.ts\n(/api/* JSON & FormData)"]
        UI <--> Hook
        Hook <--> WebSpeech
        Hook --> ApiClient
    end

    subgraph Proxy["Nginx Container (:80)"]
        Static["Static Vite Dist\n(/usr/share/nginx/html)"]
        ApiProxy["Reverse Proxy\n(location /api/ -> backend:8000)"]
    end

    subgraph Backend["FastAPI Container (:8000)"]
        Routes["routes/voice.py & delivery.py\n(Pydantic v2 Contracts)"]
        STT["services/stt.py\n(Offline faster-whisper base)"]
        Parser["services/parser.py\n(Deterministic EN/HI/KN Parser)"]
        CatSvc["services/catalogue_service.py\n& seed.py (15 SKUs)"]
        Routes --> STT
        Routes --> Parser
        Routes --> CatSvc
    end

    subgraph Data["PostgreSQL 16 Container (:5432 Internal)"]
        PG[("products\nproduct_aliases\nstock_movements")]
    end

    ApiClient -->|"HTTP :8080 / :8085"| ApiProxy
    UI -.->|"HTML/JS/CSS"| Static
    ApiProxy -->|"http://backend:8000/api/"| Routes
    CatSvc -->|"SELECT products + aliases"| PG
    Routes -->|"Atomic UPDATE + INSERT"| PG
```

---

## 2. Docker Deployment Topology

From [`docker-compose.yml`](../docker-compose.yml) and [`frontend/nginx.conf`](../frontend/nginx.conf):

```mermaid
flowchart TB
    Host["Developer / Judge Machine"]
    Port8080["Host Port ${FRONTEND_PORT:-8080} -> frontend:80"]
    Port8000["Host Port 8000 -> backend:8000"]

    subgraph ComposeNet["Docker Compose Internal Network"]
        FE["kiranaflow-frontend-1\n(nginx:alpine)\nServes Vite dist + proxies /api/"]
        BE["kiranaflow-backend-1\n(python:3.12-slim + uvicorn)\nAuto-runs init_db() & seed_catalogue()"]
        DB["kiranaflow-db-1\n(postgres:16-alpine)\nPort 5432 NOT exposed to host\nHealthcheck: pg_isready"]
        Vol[("Docker Volume: pgdata")]

        FE -->|"proxy_pass http://backend:8000/api/"| BE
        BE -->|"depends_on db (service_healthy)"| DB
        DB --- Vol
    end

    Host --> Port8080 --> FE
    Host --> Port8000 --> BE
```

### Deployment Highlights

- **Single startup command:** `docker compose up --build` initializes schema (`init_db()`), seeds 15 Indian grocery SKUs + multilingual aliases (`seed_catalogue()`), starts FastAPI, and serves the compiled SPA through Nginx.
- **No host port 5432 collision:** `db` publishes `5432/tcp` only within the internal Compose network, preventing conflicts with local PostgreSQL installations.
- **Configurable frontend port:** Defaults to `8080` and supports overrides such as `FRONTEND_PORT=8085` when port `8080` is occupied.
- **Local Vite dev mode:** `frontend/vite.config.ts` listens on `:5173` and proxies `/api` to `http://127.0.0.1:8000` (with 60s proxy timeout) for rapid frontend iteration while backend + Postgres remain in Docker.

---

## 3. Level-0 Data Flow Diagram (DFD)

```mermaid
flowchart LR
    User(("Shopkeeper"))
    Store1[("products + product_aliases")]
    Store2[("stock_movements")]
    DraftMem[("PendingDraft\n(Echoed Client-Backend)")]

    P1(["1.0 Capture & Normalize\n(Web Speech / Text)"])
    P2(["2.0 Parse & Disambiguate\n(parser.py)"])
    P3(["3.0 Commit Delivery\n(delivery.py)"])
    P4(["4.0 Stock & History Read\n(StockView / HistoryView)"])

    User -->|"Voice audio or typed text"| P1
    P1 -->|"raw transcript + lang + source"| P2
    Store1 -->|"Catalogue + EN/HI/KN aliases"| P2
    DraftMem <-->|"Current & updated PendingDraft"| P2
    P2 -->|"Clarify question OR Read-back"| User
    User -->|"Confirm / Edit / Cancel"| P3
    DraftMem -->|"Validated PendingEntry + UUID key"| P3
    P3 -->|"Atomic usable_stock & damaged_stock delta"| Store1
    P3 -->|"Immutable movement + raw_transcript"| Store2
    Store1 -->|"Stock items + is_low alerts"| P4
    Store2 -->|"Audit records"| P4
    P4 -->|"Shelf balance & WhatsApp draft"| User
```

---

## 4. Module Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| App Entry & Lifespan | `backend/main.py` | Creates tables, runs idempotent seed, attaches CORS + routes, serves `/api/health` |
| Config | `backend/app/config.py` | Loads `DATABASE_URL`, `CORS_ORIGINS`, `LLM_API_KEY`, `DEFAULT_LANGUAGE` |
| ORM Models | `backend/app/models/db_models.py` | Defines `Product`, `ProductAlias`, and `StockMovement` |
| API Schemas | `backend/app/models/schemas.py` | Pydantic v2 validation for `/api/voice/intake`, `/api/voice/parse`, `/api/deliveries/confirm*`, `/api/stock*` |
| Deterministic Parser | `backend/app/services/parser.py` | Pure-Python single/multi-item extraction, 3-tier short/fuzzy SKU match, `"both"` queuing, `received_qty`, self-correction, teen/tens & variant guards |
| Seed & Catalogue | `backend/app/services/seed.py`, `catalogue_service.py` | Idempotently seeds 15 SKUs + opening stock, syncs aliases, and loads catalogue with eager joins |
| Voice & Delivery Routes | `backend/app/routes/voice.py`, `delivery.py` | Offline Whisper transcription, single-hop intake, idempotency checks, atomic SQL updates, manual adjustments & SKU CRUD |
| Frontend Flow Hook | `frontend/src/hooks/useDeliveryFlow.ts` | Finite state machine, `1.0s` post-speech VAD timer (`12.5 Hz`), `350ms` post-TTS hands-free follow-up mic, `7s` no-voice cutoff, `isConfirmingRef` lock |
| Speech & i18n | `frontend/src/services/speech.ts`, `i18n/translations.ts` | Cross-browser `MediaRecorder`, `onend`-aware `speechSynthesis`, `hasBrowserVoice()`, live midway read-backs & UI localization |
