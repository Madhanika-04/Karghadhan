from models.request import FinancialContext
from agents.creditworthiness_agent import CreditworthinessAgent


def test_creditworthiness_agent_recommends_loan_for_stable_profile() -> None:
    agent = CreditworthinessAgent()
    context = FinancialContext(
        monthly_income=30000,
        average_balance=15000,
        monthly_expenses=18000,
        monthly_savings=5000,
        existing_emi=2000,
        loan_defaults=0,
        transaction_consistency=0.92,
        salary_or_business_credit_frequency='Monthly',
        cash_deposit_frequency='Medium',
        banking_history_months=24,
        average_monthly_credit=30000,
        average_monthly_debit=25000,
        bounce_transactions=0,
    )

    response = agent.respond('Evaluate my Yarn Passbook data for loan eligibility.', context=context)

    assert 'AI Creditworthiness Score:' in response
    assert 'Eligible: Yes' in response
    assert 'Risk Level:' in response


def test_creditworthiness_agent_reports_insufficient_data() -> None:
    agent = CreditworthinessAgent()
    response = agent.respond('Evaluate my Yarn Passbook data.', context=None)

    assert 'No Yarn Passbook financial data was provided' in response
