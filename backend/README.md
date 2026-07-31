# Karghadhan Backend — Handloom Weaver Micro-Credit Platform

A production-grade FastAPI backend powering the Karghadhan platform, which provides alternative credit scoring, micro-loan facilitation, and vernacular AI assistance to handloom weavers across India.

## Tech Stack

| Layer | Technology |
|---|---|
| API Server | FastAPI + Uvicorn |
| Validation | Pydantic v2 |
| Database / Auth | Supabase (PostgreSQL + pgvector) |
| AI Agents | LangGraph + LangChain |
| LLM | Google Gemini (primary), OpenAI (fallback) |

## Quick Start

```bash
# 1. Clone & navigate
cd backend/

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your Supabase and Gemini keys

# 5. Run the database migration
# Paste sql/001_initial_schema.sql into Supabase SQL Editor and execute

# 6. Start the server
uvicorn app.main:app --reload

# 7. Open API docs
# http://localhost:8000/docs
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/auth/register` | Register new weaver |
| `GET` | `/api/v1/weavers/{id}` | Get weaver profile |
| `PUT` | `/api/v1/weavers/{id}` | Update weaver profile |
| `POST` | `/api/v1/credit/evaluate` | Run AI credit evaluation |
| `GET` | `/api/v1/credit/{weaver_id}` | Get latest credit assessment |
| `POST` | `/api/v1/loans/apply` | Submit loan application |
| `GET` | `/api/v1/loans/{weaver_id}` | List loan applications |
| `POST` | `/api/v1/assistant/chat` | Vernacular AI assistant |

## Project Structure

```
backend/
├── .env.example
├── requirements.txt
├── sql/
│   └── 001_initial_schema.sql
└── app/
    ├── main.py          # FastAPI app + CORS + router mounting
    ├── config.py        # Pydantic BaseSettings
    ├── db/
    │   └── supabase.py  # Supabase client singleton
    ├── schemas/         # Pydantic request/response models
    ├── routers/         # FastAPI route handlers
    ├── agents/          # LangGraph AI agent definitions
    └── services/        # Shared LLM service factory
```
