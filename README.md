# KiranaFlow

**Voice-first inventory & delivery assistant for Indian kirana stores.**

Built for the Scaler × Wispr Flow "Build for Bharat" Hackathon (Round 2).

## Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd kiranaflow

# Start everything (zero API keys needed)
docker compose up --build
```

- **Frontend App:** [http://localhost:8080](http://localhost:8080) *(if port 8080 is busy on your machine, run `FRONTEND_PORT=8085 docker compose up --build`)*
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Health Check:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

## Project Structure

```
kiranaflow/
├── docker-compose.yml          # One-command startup
├── .env.example                # Environment template (all optional)
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                 # FastAPI app entry
│   └── app/
│       ├── config.py           # Centralized settings
│       ├── db.py               # SQLAlchemy engine & session
│       ├── models/
│       │   └── db_models.py    # Product, ProductAlias, StockMovement
│       ├── routes/             # API route modules
│       └── services/
│           ├── seed.py         # 15 Indian grocery SKUs + aliases
│           └── parser.py       # Deterministic voice parser
└── frontend/                   # React + TypeScript + Tailwind
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, Pydantic v2 |
| Database | PostgreSQL 16 |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Voice Input | Web Speech API |
| Voice Output | Web Speech Synthesis |

