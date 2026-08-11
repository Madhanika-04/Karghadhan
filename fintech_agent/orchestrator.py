from typing import Dict, List
from models.request import AgentResponse, UserRequest
from agents.creditworthiness_agent import CreditworthinessAgent
from agents.loan_agent import LoanAgent
from agents.scheme_agent import SchemeAgent
from agents.savings_agent import SavingsAgent
from agents.insurance_agent import InsuranceAgent
from agents.literacy_agent import LiteracyAgent
from agents.notification_agent import NotificationAgent

INTENT_KEYWORDS: Dict[str, List[str]] = {
    'creditworthiness_agent': ['yarn passbook', 'creditworthiness', 'financial behaviour', 'transaction consistency', 'banking history'],
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
            'creditworthiness_agent': CreditworthinessAgent(),
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
