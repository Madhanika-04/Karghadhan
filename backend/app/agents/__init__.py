# app/agents/__init__.py
from app.agents.base_agent import BaseAgent
from app.agents.creditworthiness_agent import creditworthiness_agent, CreditworthinessAgent
from app.agents.loan_agent import loan_agent, LoanAgent
from app.agents.scheme_agent import scheme_agent, SchemeAgent
from app.agents.insurance_agent import insurance_agent, InsuranceAgent
from app.agents.savings_agent import savings_agent, SavingsAgent
from app.agents.notification_agent import notification_agent, NotificationAgent
from app.agents.literacy_agent import literacy_agent, LiteracyAgent
from app.agents.form_agent import form_agent, FormFillingAgent

__all__ = [
    "BaseAgent",
    "creditworthiness_agent",
    "CreditworthinessAgent",
    "loan_agent",
    "LoanAgent",
    "scheme_agent",
    "SchemeAgent",
    "insurance_agent",
    "InsuranceAgent",
    "savings_agent",
    "SavingsAgent",
    "notification_agent",
    "NotificationAgent",
    "literacy_agent",
    "LiteracyAgent",
    "form_agent",
    "FormFillingAgent",
]
