from pathlib import Path

root = Path(r'c:\Users\91638\OneDrive\Documents\fintech_agent')

structure = {
    'config.py': '''import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / '.env')

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
APP_API_KEY = os.getenv('APP_API_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR / "fintech_agent.db"}')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

if OPENAI_API_KEY:
    import openai
    openai.api_key = OPENAI_API_KEY

engine = create_engine(DATABASE_URL, future=True)


def load_prompt(prompt_name: str) -> str:
    prompt_file = BASE_DIR / 'prompts' / f'{prompt_name}.txt'
    if not prompt_file.exists():
        raise FileNotFoundError(f'Prompt file not found: {prompt_file}')
    return prompt_file.read_text(encoding='utf-8').strip()


def validate_environment() -> None:
    missing = []
    if not OPENAI_API_KEY:
        missing.append('OPENAI_API_KEY')
    if not APP_API_KEY:
        missing.append('APP_API_KEY')
    if missing:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")
''',
    'api.py': '''import logging
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import APP_API_KEY, LOG_LEVEL, validate_environment
from models.request import AgentResponse, UserRequest
from orchestrator import Orchestrator

logger = logging.getLogger('fintech_agent')
logger.setLevel(LOG_LEVEL)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s - %(message)s'))
logger.addHandler(handler)

app = FastAPI(
    title='FINTECH_AGENT',
    description='A modular AI fintech agent ecosystem for loan, savings, insurance, scheme discovery, literacy, and reminders.',
    version='1.0.0',
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

orchestrator = Orchestrator()


@app.on_event('startup')
def startup_event() -> None:
    try:
        validate_environment()
        logger.info('FINTECH_AGENT startup complete.')
    except EnvironmentError as exc:
        logger.error('Environment validation failed: %s', exc)
        raise


@app.get('/')
def root() -> dict:
    return {'service': 'FINTECH_AGENT', 'status': 'ok'}


@app.post('/agent/query', response_model=AgentResponse)
def query_agent(payload: UserRequest, x_api_key: str = Header(..., alias='x-api-key')) -> AgentResponse:
    if x_api_key != APP_API_KEY:
        logger.warning('Unauthorized access attempt with invalid API key.')
        raise HTTPException(status_code=401, detail='Invalid API key.')

    try:
        response = orchestrator.process_request(payload)
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Agent query failed: %s', exc)
        raise HTTPException(status_code=500, detail='Unable to process request at this time.')
''',
    'orchestrator.py': '''from typing import Dict, List
from models.request import AgentResponse, UserRequest
from agents.loan_agent import LoanAgent
from agents.scheme_agent import SchemeAgent
from agents.savings_agent import SavingsAgent
from agents.insurance_agent import InsuranceAgent
from agents.literacy_agent import LiteracyAgent
from agents.notification_agent import NotificationAgent

INTENT_KEYWORDS: Dict[str, List[str]] = {
    'loan_agent': ['loan', 'borrow', 'emi', 'interest rate', 'repayment', 'mortgage', 'financing', 'credit'],
    'scheme_agent': ['scheme', 'subsidy', 'government', 'pm', 'msme', 'eligibility', 'application', 'benefits'],
    'savings_agent': ['save', 'saving', 'budget', 'expense', 'income', 'goal', 'emergency fund'],
    'insurance_agent': ['insurance', 'coverage', 'policy', 'health insurance', 'life insurance', 'business insurance', 'renewal'],
    'literacy_agent': ['credit score', 'interest', 'banking', 'digital payments', 'fraud', 'financial literacy', 'learn', 'education'],
    'notification_agent': ['reminder', 'deadline', 'renewal', 'due date', 'notify', 'alert', 'payment reminder'],
}
DEFAULT_AGENT = 'literacy_agent'


class Orchestrator:
    def __init__(self) -> None:
        self.agents = {
            'loan_agent': LoanAgent(),
            'scheme_agent': SchemeAgent(),
            'savings_agent': SavingsAgent(),
            'insurance_agent': InsuranceAgent(),
            'literacy_agent': LiteracyAgent(),
            'notification_agent': NotificationAgent(),
        }

    def select_agent(self, message: str) -> str:
        normalized = message.lower()
        for agent_key, keywords in INTENT_KEYWORDS.items():
            if any(keyword in normalized for keyword in keywords):
                return agent_key
        return DEFAULT_AGENT

    def process_request(self, request: UserRequest) -> AgentResponse:
        agent_key = self.select_agent(request.message)
        agent = self.agents[agent_key]
        response_text = agent.respond(request.message, request.context)
        return AgentResponse(
            agent=agent_key,
            response=response_text,
            details={
                'selected_by': 'intent_keywords',
                'selected_agent': agent_key,
            },
        )
''',
    'models/__init__.py': '''# FinTech Agent data models package.''',
    'models/request.py': '''from pydantic import BaseModel, Field
from typing import Dict, Optional, Any


class FinancialContext(BaseModel):
    income: Optional[float] = Field(None, description='Monthly or annual income amount.')
    expenses: Optional[float] = Field(None, description='Monthly or annual expenses amount.')
    loan_amount: Optional[float] = Field(None, description='Desired loan amount.')
    interest_rate: Optional[float] = Field(None, description='Annual interest rate as a percentage.')
    duration_months: Optional[int] = Field(None, description='Loan duration in months.')
    credit_score: Optional[int] = Field(None, description='Estimated credit score.')
    employment_status: Optional[str] = Field(None, description='Employment or business status.')
    goals: Optional[str] = Field(None, description='Financial goals or objectives.')
    scheme_preferences: Optional[str] = Field(None, description='Preferences for government schemes or subsidy programs.')
    deadlines: Optional[Dict[str, str]] = Field(None, description='Key deadlines and reminders.')


class UserRequest(BaseModel):
    user_id: str = Field(..., min_length=1, description='Unique identifier for the user.')
    message: str = Field(..., min_length=1, description='User message describing the financial request.')
    context: Optional[FinancialContext] = Field(None, description='Optional financial context for the request.')


class AgentResponse(BaseModel):
    agent: str
    response: str
    details: Optional[Dict[str, Any]] = None
''',
    'agents/__init__.py': '''from .insurance_agent import InsuranceAgent
from .literacy_agent import LiteracyAgent
from .loan_agent import LoanAgent
from .notification_agent import NotificationAgent
from .savings_agent import SavingsAgent
from .scheme_agent import SchemeAgent

__all__ = [
    'InsuranceAgent',
    'LiteracyAgent',
    'LoanAgent',
    'NotificationAgent',
    'SavingsAgent',
    'SchemeAgent',
]
''',
    'agents/loan_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext
from tools.emi_calculator import calculate_emi


class LoanAgent:
    name = 'loan_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('loan_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        details = ''
        if context and context.loan_amount is not None and context.interest_rate is not None and context.duration_months is not None:
            try:
                emi = calculate_emi(context.loan_amount, context.interest_rate, context.duration_months)
                details = (
                    f"Loan calculator results:\n"
                    f"- Monthly EMI: {emi['monthly_emi']:.2f}\n"
                    f"- Total payment: {emi['total_payment']:.2f}\n"
                    f"- Total interest: {emi['total_interest']:.2f}\n"
                )
            except ValueError as exc:
                details = f'EMI calculation requires valid positive loan details. {exc}'

        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=700,
            temperature=0.75,
        )

        answer = completion.choices[0].message.content.strip()
        return f'{details}\n\n{answer}' if details else answer
''',
    'agents/scheme_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class SchemeAgent:
    name = 'scheme_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('scheme_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=700,
            temperature=0.7,
        )

        return completion.choices[0].message.content.strip()
''',
    'agents/savings_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class SavingsAgent:
    name = 'savings_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('savings_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=650,
            temperature=0.7,
        )

        return completion.choices[0].message.content.strip()
''',
    'agents/insurance_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class InsuranceAgent:
    name = 'insurance_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('insurance_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=700,
            temperature=0.7,
        )

        return completion.choices[0].message.content.strip()
''',
    'agents/literacy_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class LiteracyAgent:
    name = 'literacy_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('literacy_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=650,
            temperature=0.7,
        )

        return completion.choices[0].message.content.strip()
''',
    'agents/notification_agent.py': '''import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class NotificationAgent:
    name = 'notification_agent'

    def __init__(self) -> None:
        self.system_prompt = load_prompt('notification_prompt')

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += '\n\nFinancial context:\n'
            user_content += context.json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=650,
            temperature=0.7,
        )

        return completion.choices[0].message.content.strip()
''',
    'tools/__init__.py': '''# FinTech Agent tools package.''',
    'tools/emi_calculator.py': '''from typing import Dict


def calculate_emi(loan_amount: float, annual_interest_rate: float, duration_months: int) -> Dict[str, float]:
    if loan_amount <= 0:
        raise ValueError('Loan amount must be positive.')
    if duration_months <= 0:
        raise ValueError('Loan duration must be greater than zero months.')
    if annual_interest_rate < 0:
        raise ValueError('Interest rate cannot be negative.')

    monthly_rate = annual_interest_rate / 1200.0
    if monthly_rate == 0:
        monthly_emi = loan_amount / duration_months
    else:
        numerator = loan_amount * monthly_rate * (1 + monthly_rate) ** duration_months
        denominator = (1 + monthly_rate) ** duration_months - 1
        monthly_emi = numerator / denominator

    total_payment = monthly_emi * duration_months
    total_interest = total_payment - loan_amount

    return {
        'monthly_emi': round(monthly_emi, 2),
        'total_payment': round(total_payment, 2),
        'total_interest': round(total_interest, 2),
    }
''',
    'prompts/loan_prompt.txt': '''You are the Loan Agent for FINTECH_AGENT.

Role:
- Understand user loan requirements.
- Ask clarifying financial questions.
- Calculate loan eligibility and EMI.
- Explain repayment schedules and terms.
- Suggest suitable loan options.

Rules:
- Use clear, simple language.
- Do not provide misleading financial advice.
- Include disclaimers that users should verify details with licensed providers.
- Keep recommendations practical and grounded.

Response format:
- Start with a short summary.
- Provide clear next steps.
- Include EMI details and eligibility guidance when available.

Safety:
- Avoid promising approval or interest rates.
- Do not recommend products without explaining assumptions.
''',
    'prompts/scheme_prompt.txt': '''You are the Government Scheme Agent for FINTECH_AGENT.

Role:
- Identify suitable government financial schemes.
- Explain eligibility criteria and benefits.
- Provide application guidance for relevant programs.
- Highlight PM schemes, MSME schemes, subsidy programs, and support for artisans.

Rules:
- Keep explanations factual and simple.
- Never misrepresent government policy.
- Advise users to verify scheme details on official portals.

Response format:
- Start with recommended schemes.
- List eligibility requirements and benefits.
- Provide application guidance and next steps.
''',
    'prompts/savings_prompt.txt': '''You are the Savings Agent for FINTECH_AGENT.

Role:
- Analyze income and expenses.
- Suggest saving strategies.
- Create personalized saving plans.
- Recommend budgeting methods.

Rules:
- Use simple language for inexperienced users.
- Provide practical, realistic savings advice.
- Do not promise guaranteed investment returns.

Response format:
- Provide a savings plan summary.
- List practical budgeting tips.
- Suggest achievable monthly goals.
''',
    'prompts/insurance_prompt.txt': '''You are the Insurance Agent for FINTECH_AGENT.

Role:
- Explain insurance products.
- Recommend suitable insurance categories.
- Explain coverage and policy differences.
- Compare health, life, business, and government insurance.

Rules:
- Keep language easy to understand.
- Clearly state assumptions and coverage limitations.
- Encourage users to compare quotes with licensed insurers.

Response format:
- Start with recommended insurance categories.
- Explain coverage and policy benefits.
- Provide comparison guidance.
''',
    'prompts/literacy_prompt.txt': '''You are the Financial Literacy Agent for FINTECH_AGENT.

Role:
- Educate users on banking concepts, loans, interest rates, credit scores, digital payments, and fraud prevention.
- Keep explanations simple and clear.
- Support financially inexperienced users.

Rules:
- Use examples and plain language.
- Avoid jargon without explanation.
- Reinforce safe financial behavior.

Response format:
- Provide a concise explanation.
- Offer practical tips.
- Suggest next steps for learning.
''',
    'prompts/notification_prompt.txt': '''You are the Notification Agent for FINTECH_AGENT.

Role:
- Send reminders and track financial deadlines.
- Notify users about EMI payments, scheme deadlines, insurance renewals, and savings goals.
- Help users stay on schedule with financial obligations.

Rules:
- Be concise and actionable.
- Confirm the type of reminder and due date.
- Suggest how the user can follow up or set a calendar alert.

Response format:
- Start with the reminder type.
- Include the deadline or next action.
- Provide a short planning suggestion.
''',
    'requirements.txt': '''fastapi
uvicorn[standard]
pydantic
python-dotenv
openai
sqlalchemy
requests
''',
    'README.md': '''# FINTECH_AGENT

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
venv\\Scripts\\activate
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

## Future Expansion

- Add new agents for credit scoring, investment recommendations, and banking API integration.
- Integrate with actual banking and insurance APIs.
- Add vector memory, multilingual support, and cloud deployment.
- Add persistent storage for user sessions and reminders.
''',
    '.env.example': '''OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
APP_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./fintech_agent.db
LOG_LEVEL=INFO
''',
    '.env': '''OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
APP_API_KEY=
DATABASE_URL=sqlite:///./fintech_agent.db
LOG_LEVEL=INFO
''',
}

for file_path, content in structure.items():
    path = root / file_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

# Fix misnamed init if present
old_init = root / 'agents' / '__init__.py__'
new_init = root / 'agents' / '__init__.py'
if old_init.exists() and not new_init.exists():
    old_init.rename(new_init)

print('Completed file generation.')
''