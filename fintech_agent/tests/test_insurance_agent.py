from agents.insurance_agent import InsuranceAgent
from models.request import FinancialContext


def test_insurance_agent_builds_recommendation_response() -> None:
    agent = InsuranceAgent()
    context = FinancialContext(
        monthly_income=18000,
        employment_status='Self-employed',
        goals='I need protection for my family and small shop',
        scheme_preferences='government support',
    )

    response = agent.respond('What insurance should I buy?', context=context)

    assert 'Recommended insurance categories:' in response
    assert '- Health Insurance:' in response
    assert '- Life Insurance:' in response
    assert '- Business Insurance:' in response
    assert '- Government Insurance Scheme:' in response
    assert 'Why this is recommended:' in response
    assert 'Coverage guidance:' in response
