# FINTECH_AGENT

FINTECH_AGENT is a modular AI FinTech platform built as an independent agent ecosystem. It routes financial requests to specialized agents for loan assistance, government scheme discovery, savings guidance, insurance recommendations, financial literacy education, and notifications.

## Project Structure

- `agents/` - Specialized financial AI agents.
- `prompts/` - System prompts for each agent.
- `tools/` - Reusable financial calculation utilities.
- `models/` - Request and response data models.
- `api.py` - FastAPI backend entrypoint.
- `orchestrator.py` - Intelligent routing manager.
- `config.py` - Environment and API configuration.
- `.env.example` - Example environment variables.

## Installation

1. Clone the repository.
2. Create a virtual environment.

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

3. Copy the `.env.example` file to `.env` and configure values.

```bash
copy .env.example .env
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key.
- `OPENAI_MODEL` - OpenAI model name (default: `gpt-4o-mini`).
- `APP_API_KEY` - API key required by the FastAPI endpoint.
- `DATABASE_URL` - Database connection URL.
- `LOG_LEVEL` - Logging level (default: `INFO`).

## Running the API

```bash
uvicorn api:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## API Usage

### POST `/agent/query`

Request body:

```json
{
  "user_id": "123",
  "message": "I need a loan for my new small business",
  "context": {
    "income": 40000,
    "expenses": 18000,
    "loan_amount": 500000,
    "interest_rate": 10.5,
    "duration_months": 48,
    "credit_score": 720,
    "employment_status": "self-employed"
  }
}
```

Headers:

- `x-api-key`: Your application API key.

Example response:

```json
{
  "agent": "loan_agent",
  "response": "...",
  "details": {
    "selected_by": "intent_keywords",
    "selected_agent": "loan_agent"
  }
}
```

## Testing Examples

1. Loan assistance: `I need a loan for my weaving business.`
2. Scheme discovery: `Which government schemes can help my MSME?`
3. Savings guidance: `How can I save more from my monthly income?`
4. Insurance help: `What insurance should I buy for my small store?`
5. Literacy support: `Explain how credit score works.`
6. Notifications: `Remind me when my policy renewal is due.`

## Running Tests

Install test dependencies and run tests with:

```bash
pip install pytest
pytest
```

If you want to run a single test module:

```bash
pytest tests/test_emi_calculator.py
```

## Future Expansion

- Add new agents for credit scoring, investment recommendations, and banking API integration.
- Integrate with actual banking and insurance APIs.
- Add vector memory, multilingual support, and cloud deployment.
- Add persistent storage for user sessions and reminders.
