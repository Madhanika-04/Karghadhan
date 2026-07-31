"""
app/services/finance_service.py
Service functions for weaver financial protection: automated micro-savings, micro-insurance deductions, transaction payout splits, and financial summary calculation.
"""
from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Any

from fastapi import HTTPException, status
from app.db.firebase import db as default_db
from app.schemas.finance import (
    SavingsSummary,
    InsurancePolicy,
    TransactionPayoutSplit,
    FinancialSummaryResponse,
)

logger = logging.getLogger(__name__)

WEAVERS_COLLECTION = "weavers"
TRANSACTIONS_COLLECTION = "transaction_ledger"

POLICY_CATALOG = {
    "PMJJBY": {
        "policy_id": "PMJJBY",
        "policy_name": "PMJJBY - Weaver Cover",
        "sum_assured": 200000.0,
        "annual_premium": 436.0,
        "monthly_deduction_rate": 36.00,
    },
    "PMSBY": {
        "policy_id": "PMSBY",
        "policy_name": "PMSBY - Weaver Accidental Cover",
        "sum_assured": 200000.0,
        "annual_premium": 20.0,
        "monthly_deduction_rate": 2.00,
    },
    "MGBBY": {
        "policy_id": "MGBBY",
        "policy_name": "MGBBY - Handloom Weaver Special Cover",
        "sum_assured": 500000.0,
        "annual_premium": 470.0,
        "monthly_deduction_rate": 39.00,
    },
}


def process_informal_payout(
    weaver_id: Any,
    gross_amount: float,
    db_client: Any = None,
) -> TransactionPayoutSplit:
    """
    Process informal saree sale payout:
      - Calculates 5% micro-savings deduction (or monthly_contribution_pct from weaver profile).
      - Checks if monthly insurance premium slice (₹36.00 or active policy rate) is due; if so, deducts it.
      - Updates weaver's `savingsSummary` and `insurancePolicies` documents in Firestore.
      - Appends detailed ledger entry to `weavers/{weaver_id}/transactions` and global `transaction_ledger`.
      - Returns TransactionPayoutSplit.
    """
    if db_client is None:
        db_client = default_db

    weaver_id_str = str(weaver_id)
    doc_ref = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver {weaver_id_str} not found.",
        )

    weaver_data = doc.to_dict() or {}
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    current_year_month = now_iso[:7]  # YYYY-MM

    # 1. Micro-Savings calculation (default 5%)
    raw_savings = weaver_data.get("savings_summary") or weaver_data.get("savingsSummary") or {}
    savings_obj = SavingsSummary(**raw_savings) if isinstance(raw_savings, dict) else SavingsSummary()

    contribution_pct = savings_obj.monthly_contribution_pct or 5.0
    savings_deducted = round(gross_amount * (contribution_pct / 100.0), 2)
    updated_savings_balance = round(savings_obj.total_savings_balance + savings_deducted, 2)

    savings_obj.total_savings_balance = updated_savings_balance
    savings_dict = savings_obj.model_dump()

    # 2. Insurance deduction calculation
    raw_policies = weaver_data.get("insurance_policies") or weaver_data.get("insurancePolicies") or []
    policies_list: list[dict] = []
    insurance_deducted = 0.0

    for item in raw_policies:
        pol_dict = dict(item) if isinstance(item, dict) else item.model_dump()
        status_val = pol_dict.get("status", "ACTIVE")
        last_deducted = pol_dict.get("last_deducted_at")
        monthly_rate = float(pol_dict.get("monthly_deduction_rate", 36.00))

        # Check if monthly slice is due
        is_due = False
        if status_val in ["ACTIVE", "DUE"]:
            if not last_deducted:
                is_due = True
            elif last_deducted[:7] < current_year_month:
                is_due = True

        if is_due:
            insurance_deducted += monthly_rate
            pol_dict["last_deducted_at"] = now_iso
            pol_dict["status"] = "ACTIVE"

        policies_list.append(pol_dict)

    insurance_deducted = round(insurance_deducted, 2)

    # 3. Net payout calculation
    net_payout = round(gross_amount - savings_deducted - insurance_deducted, 2)
    if net_payout < 0:
        net_payout = 0.0

    # 4. Update weaver document in Firestore
    doc_ref.set(
        {
            "savings_summary": savings_dict,
            "savingsSummary": savings_dict,
            "insurance_policies": policies_list,
            "insurancePolicies": policies_list,
            "updated_at": now_iso,
        },
        merge=True,
    )

    # 5. Append detailed transaction ledger entry
    tx_id = str(uuid.uuid4())
    tx_data = {
        "id": tx_id,
        "weaver_id": weaver_id_str,
        "gross_payout": gross_amount,
        "savings_deducted": savings_deducted,
        "insurance_deducted": insurance_deducted,
        "net_payout_to_weaver": net_payout,
        "transaction_type": "INFORMAL_SAREE_SALE",
        "description": (
            f"Informal saree sale payout: Gross ₹{gross_amount:.2f}, "
            f"Savings ₹{savings_deducted:.2f}, Insurance ₹{insurance_deducted:.2f}, "
            f"Net Payout ₹{net_payout:.2f}"
        ),
        "amount": gross_amount,
        "transacted_at": now_iso,
        "created_at": now_iso,
    }

    # Write to weavers/{weaver_id}/transactions AND global transaction_ledger
    db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str).collection("transactions").document(tx_id).set(tx_data)
    db_client.collection(TRANSACTIONS_COLLECTION).document(tx_id).set(tx_data)

    return TransactionPayoutSplit(
        gross_payout=gross_amount,
        savings_deducted=savings_deducted,
        insurance_deducted=insurance_deducted,
        net_payout_to_weaver=net_payout,
    )


def enroll_weaver_insurance(
    weaver_id: Any,
    policy_name: str,
    db_client: Any = None,
) -> InsurancePolicy:
    """
    Enrolls the weaver in PMJJBY / PMSBY / MGBBY insurance by pre-filling profile details
    and setting policy status to ACTIVE in Firestore.
    """
    if db_client is None:
        db_client = default_db

    weaver_id_str = str(weaver_id)
    doc_ref = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver {weaver_id_str} not found.",
        )

    weaver_data = doc.to_dict() or {}
    now_iso = datetime.now(timezone.utc).isoformat()

    # Match policy template
    policy_key = "PMJJBY"
    upper_name = policy_name.upper()
    if "PMSBY" in upper_name:
        policy_key = "PMSBY"
    elif "MGBBY" in upper_name:
        policy_key = "MGBBY"
    elif "PMJJBY" in upper_name:
        policy_key = "PMJJBY"

    template = POLICY_CATALOG.get(policy_key, {
        "policy_id": upper_name[:20],
        "policy_name": policy_name,
        "sum_assured": 200000.0,
        "annual_premium": 436.0,
        "monthly_deduction_rate": 36.00,
    })

    new_policy = InsurancePolicy(
        policy_id=template["policy_id"],
        policy_name=template["policy_name"],
        sum_assured=template["sum_assured"],
        annual_premium=template["annual_premium"],
        status="ACTIVE",
        monthly_deduction_rate=template["monthly_deduction_rate"],
        last_deducted_at=None,
    )
    new_policy_dict = new_policy.model_dump()

    # Update weaver policies
    raw_policies = weaver_data.get("insurance_policies") or weaver_data.get("insurancePolicies") or []
    updated_policies = []
    replaced = False

    for item in raw_policies:
        p_dict = dict(item) if isinstance(item, dict) else item.model_dump()
        if p_dict.get("policy_id") == new_policy.policy_id:
            p_dict.update(new_policy_dict)
            replaced = True
        updated_policies.append(p_dict)

    if not replaced:
        updated_policies.append(new_policy_dict)

    doc_ref.set(
        {
            "insurance_policies": updated_policies,
            "insurancePolicies": updated_policies,
            "updated_at": now_iso,
        },
        merge=True,
    )

    return new_policy


def get_financial_summary(
    weaver_id: Any,
    db_client: Any = None,
) -> FinancialSummaryResponse:
    """
    Returns liquid balance, total thrift savings balance, and active insurance coverage details for UI display.
    """
    if db_client is None:
        db_client = default_db

    weaver_id_str = str(weaver_id)
    doc_ref = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver {weaver_id_str} not found.",
        )

    weaver_data = doc.to_dict() or {}

    # Savings summary
    raw_savings = weaver_data.get("savings_summary") or weaver_data.get("savingsSummary") or {}
    savings_obj = SavingsSummary(**raw_savings) if isinstance(raw_savings, dict) else SavingsSummary()

    # Insurance policies
    raw_policies = weaver_data.get("insurance_policies") or weaver_data.get("insurancePolicies") or []
    policies_list = []
    active_coverage = 0.0

    for item in raw_policies:
        pol_dict = dict(item) if isinstance(item, dict) else item.model_dump()
        pol_obj = InsurancePolicy(**pol_dict)
        policies_list.append(pol_obj)
        if pol_obj.status == "ACTIVE":
            active_coverage += pol_obj.sum_assured

    # Calculate liquid balance from transaction ledger
    liquid_balance = 0.0
    try:
        tx_stream = db_client.collection(TRANSACTIONS_COLLECTION).where("weaver_id", "==", weaver_id_str).stream()
        for tx_doc in tx_stream:
            tx_data = tx_doc.to_dict() or {}
            if "net_payout_to_weaver" in tx_data:
                liquid_balance += float(tx_data.get("net_payout_to_weaver", 0.0))
            elif tx_data.get("transaction_type") == "INCOME":
                liquid_balance += float(tx_data.get("amount", 0.0))
            elif tx_data.get("transaction_type") in ["EXPENSE", "LOAN_REPAYMENT"]:
                liquid_balance -= float(tx_data.get("amount", 0.0))
    except Exception as exc:
        logger.warning("Error fetching liquid balance transactions: %s", exc)

    return FinancialSummaryResponse(
        liquid_balance=round(liquid_balance, 2),
        total_thrift_savings_balance=round(savings_obj.total_savings_balance, 2),
        active_insurance_coverage=round(active_coverage, 2),
        savings_summary=savings_obj,
        insurance_policies=policies_list,
    )
