"""
backend/test_finance.py
Unit tests and API verification for KarghaDhan Financial Protection Engine.
"""
from unittest.mock import MagicMock

def test_pydantic_schemas():
    from app.schemas.finance import (
        SavingsSummary,
        InsurancePolicy,
        TransactionPayoutSplit,
        PayoutProcessRequest,
        InsuranceEnrollRequest,
        FinancialSummaryResponse,
    )

    savings = SavingsSummary(total_savings_balance=500.0, monthly_contribution_pct=5.0, matching_bonus=100.0)
    assert savings.total_savings_balance == 500.0
    assert savings.monthly_contribution_pct == 5.0

    policy = InsurancePolicy(
        policy_id="PMJJBY",
        policy_name="PMJJBY - Weaver Cover",
        sum_assured=200000.0,
        annual_premium=436.0,
        status="ACTIVE",
        monthly_deduction_rate=36.0,
    )
    assert policy.policy_id == "PMJJBY"
    assert policy.monthly_deduction_rate == 36.0

    split = TransactionPayoutSplit(
        gross_payout=8000.0,
        savings_deducted=400.0,
        insurance_deducted=36.0,
        net_payout_to_weaver=7564.0,
    )
    assert split.net_payout_to_weaver == 7564.0
    print("[OK] Pydantic Schemas Verified")


def test_finance_service_mocked():
    from app.services.finance_service import (
        process_informal_payout,
        enroll_weaver_insurance,
        get_financial_summary,
    )

    mock_db = MagicMock()
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {
        "id": "test-weaver-1",
        "savings_summary": {"total_savings_balance": 100.0, "monthly_contribution_pct": 5.0, "matching_bonus": 0.0},
        "insurance_policies": [
            {
                "policy_id": "PMJJBY",
                "policy_name": "PMJJBY - Weaver Cover",
                "sum_assured": 200000.0,
                "annual_premium": 436.0,
                "status": "ACTIVE",
                "monthly_deduction_rate": 36.0,
                "last_deducted_at": None,
            }
        ],
    }
    mock_db.collection().document().get.return_value = mock_doc

    # Process payout
    split = process_informal_payout(weaver_id="test-weaver-1", gross_amount=8000.0, db_client=mock_db)
    assert split.gross_payout == 8000.0
    assert split.savings_deducted == 400.0  # 5% of 8000
    assert split.insurance_deducted == 36.0 # Monthly PMJJBY slice
    assert split.net_payout_to_weaver == 7564.0
    print("[OK] process_informal_payout Service Logic Verified")

    # Enroll insurance
    policy = enroll_weaver_insurance(weaver_id="test-weaver-1", policy_name="PMSBY", db_client=mock_db)
    assert policy.policy_id == "PMSBY"
    assert policy.status == "ACTIVE"
    print("[OK] enroll_weaver_insurance Service Logic Verified")

    # Summary
    summary = get_financial_summary(weaver_id="test-weaver-1", db_client=mock_db)
    assert summary.active_insurance_coverage >= 200000.0
    print("[OK] get_financial_summary Service Logic Verified")


if __name__ == "__main__":
    test_pydantic_schemas()
    test_finance_service_mocked()
    print("All Finance Engine Tests Passed!")
