"""
backend/test_all_agents.py
Comprehensive test suite verifying real-world Yarn Passbook transaction history evaluation across KarghaDhan Multi-Agent system.
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

def test_insurance_agent_yarn_passbook():
    user = {
        "age": 32,
        "yarn_passbook_id": "YP-2024-UP-098",
        "yarn_quota_utilization_pct": 75.0,
        "yarn_passbook_transactions": [
            {"transaction_type": "INFORMAL_SAREE_SALE", "amount": 8000.0},
            {"transaction_type": "INFORMAL_SAREE_SALE", "amount": 7500.0},
        ],
        "loom_assets": [{"id": "loom-1", "capacity": 10}],
        "active_policies": [],
    }
    res = insurance_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["has_active_yarn_passbook"] is True
    assert res["passbook_monthly_turnover_inr"] == 15500.0
    
    # Check that PMJJBY, PMSBY, MGBBY, LOOM_ASSET_PROTECT were evaluated
    policies = {p["policy_id"]: p for p in res["evaluated_policies"]}
    assert policies["PMJJBY"]["eligibility_status"] == "ELIGIBLE"
    assert policies["PMSBY"]["eligibility_status"] == "ELIGIBLE"
    assert policies["MGBBY"]["eligibility_status"] == "ELIGIBLE"
    assert policies["LOOM_ASSET_PROTECT"]["eligibility_status"] == "ELIGIBLE"
    print("[OK] insurance_agent real-world Yarn Passbook evaluation passed")


def test_scheme_agent_yarn_passbook():
    user = {
        "experience_years": 4,
        "pehchan_id": "IND-HL-98765",
        "yarn_passbook_id": "YP-2024-UP-098",
        "yarn_quota_utilization_pct": 80.0,
        "yarn_passbook_transactions": [{"transaction_type": "CREDIT", "amount": 5000.0}],
    }
    res = scheme_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["has_verified_yarn_passbook"] is True
    assert res["total_eligible_schemes"] >= 3
    print("[OK] scheme_agent real-world Yarn Passbook matching passed")


def test_loan_agent_passbook_cashflow():
    user = {
        "yarn_passbook_transactions": [
            {"transaction_type": "INFORMAL_SAREE_SALE", "amount": 12000.0},
            {"transaction_type": "INFORMAL_SAREE_SALE", "amount": 8000.0},
        ],
        "credit_score": 720,
        "requested_amount": 50000.0,
        "tenure_months": 12,
    }
    res = loan_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    assert res["verified_monthly_cashflow_inr"] == 20000.0
    assert res["subvention_interest_rate_pct"] == 5.0
    assert res["eligibility_status"] == "APPROVED"
    print("[OK] loan_agent real-world Yarn Passbook cashflow loan calculation passed")


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
    print("[OK] creditworthiness_agent passed")


def test_savings_agent():
    user = {
        "monthly_income": 18000.0,
        "monthly_expenses": 11000.0,
        "total_savings_balance": 1500.0,
        "monthly_contribution_pct": 5.0,
    }
    res = savings_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    print("[OK] savings_agent passed")


def test_notification_agent():
    user = {
        "upcoming_emi_date": "2026-08-05",
        "upcoming_emi_amount": 4200.0,
        "insurance_slice_due": True,
    }
    res = notification_agent.run(user_details=user)
    assert res["execution_mode"] == "DETERMINISTIC"
    print("[OK] notification_agent passed")


def test_literacy_agent():
    res = literacy_agent.run(user_details={}, message="Tell me about credit score")
    assert res["execution_mode"] == "DETERMINISTIC"
    print("[OK] literacy_agent passed")


if __name__ == "__main__":
    test_insurance_agent_yarn_passbook()
    test_scheme_agent_yarn_passbook()
    test_loan_agent_passbook_cashflow()
    test_creditworthiness_agent()
    test_savings_agent()
    test_notification_agent()
    test_literacy_agent()
    print("All Real-World Yarn Passbook & Agent Tests Passed!")
