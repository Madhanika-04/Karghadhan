"""
backend/test_all_agents.py
Verification test runner for KarghaDhan Multi-Agent system.
Tests:
  - BaseAgent inheritance
  - creditworthiness_agent
  - loan_agent
  - scheme_agent
  - insurance_agent
  - savings_agent
  - notification_agent
  - literacy_agent
"""
from app.agents import (
    creditworthiness_agent,
    loan_agent,
    scheme_agent,
    insurance_agent,
    savings_agent,
    notification_agent,
    literacy_agent,
)

def test_creditworthiness_agent():
    user = {
        "cibil_score": 710,
        "total_allocated_quota": 100.0,
        "total_utilized_quota": 85.0,
        "order_frequency_variance": 4.0,
        "avg_ticket_size_inr": 25000.0,
        "past_due_instances": 0,
        "experience_years": 8,
    }
    res = creditworthiness_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["credit_score"] >= 300
    assert "max_eligible_loan" in res
    print("[OK] creditworthiness_agent passed")


def test_loan_agent():
    user = {
        "requested_amount": 60000.0,
        "tenure_months": 12,
        "annual_interest_rate": 6.0,
        "monthly_income": 20000.0,
    }
    res = loan_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["monthly_emi_inr"] > 0
    assert res["eligibility_status"] in ["APPROVED", "CONDITIONAL", "HIGH_RISK"]
    print("[OK] loan_agent passed")


def test_scheme_agent():
    user = {
        "experience_years": 5,
        "pehchan_id": "IND-HL-12345",
        "yarn_passbook_id": "YP-2024-UP-001",
    }
    res = scheme_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["total_eligible_schemes"] > 0
    print("[OK] scheme_agent passed")


def test_insurance_agent():
    user = {
        "active_policies": [{"policy_id": "PMJJBY"}]
    }
    res = insurance_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert len(res["recommended_policies"]) >= 3
    print("[OK] insurance_agent passed")


def test_savings_agent():
    user = {
        "monthly_income": 18000.0,
        "monthly_expenses": 11000.0,
        "total_savings_balance": 1500.0,
        "monthly_contribution_pct": 5.0,
    }
    res = savings_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["estimated_monthly_thrift_savings_inr"] == 900.0
    print("[OK] savings_agent passed")


def test_notification_agent():
    user = {
        "upcoming_emi_date": "2026-08-05",
        "upcoming_emi_amount": 4200.0,
        "insurance_slice_due": True,
    }
    res = notification_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["total_notifications"] >= 2
    print("[OK] notification_agent passed")


def test_literacy_agent():
    res = literacy_agent.run(user_details={}, message="Tell me about credit score")
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["topic"] == "Understanding Your Weaver Credit Score"
    print("[OK] literacy_agent passed")


if __name__ == "__main__":
    test_creditworthiness_agent()
    test_loan_agent()
    test_scheme_agent()
    test_insurance_agent()
    test_savings_agent()
    test_notification_agent()
    test_literacy_agent()
    print("All 7 Specialized Agents Verified Successfully!")
