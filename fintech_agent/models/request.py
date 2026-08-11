from pydantic import BaseModel, Field
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
    monthly_income: Optional[float] = Field(None, description='Average monthly income from Yarn Passbook.')
    average_balance: Optional[float] = Field(None, description='Average bank account balance in the last months.')
    monthly_expenses: Optional[float] = Field(None, description='Average monthly expenses.')
    monthly_savings: Optional[float] = Field(None, description='Average monthly savings.')
    existing_emi: Optional[float] = Field(None, description='Existing EMI obligations per month.')
    loan_defaults: Optional[int] = Field(None, description='Number of loan defaults on record.')
    transaction_consistency: Optional[float] = Field(None, description='Transaction consistency score from 0 to 1.')
    salary_or_business_credit_frequency: Optional[str] = Field(None, description='Frequency of salary or business credits.')
    cash_deposit_frequency: Optional[str] = Field(None, description='Frequency of cash deposits into the account.')
    banking_history_months: Optional[int] = Field(None, description='Number of months of banking history.')
    average_monthly_credit: Optional[float] = Field(None, description='Average monthly credit amount.')
    average_monthly_debit: Optional[float] = Field(None, description='Average monthly debit amount.')
    bounce_transactions: Optional[int] = Field(None, description='Number of bounced transactions.')


class UserRequest(BaseModel):
    user_id: str = Field(..., min_length=1, description='Unique identifier for the user.')
    message: str = Field(..., min_length=1, description='User message describing the financial request.')
    context: Optional[FinancialContext] = Field(None, description='Optional financial context for the request.')


class AgentResponse(BaseModel):
    agent: str
    response: str
    details: Optional[Dict[str, Any]] = None
