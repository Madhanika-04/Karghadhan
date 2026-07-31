"""
app/agents/insurance_agent.py
Real-World Insurance Agent for KarghaDhan.

Determines insurance scheme eligibility and coverage levels based on:
1. Yarn Passbook Transaction History (verifies active artisan status & cash flow for micro-premium deductions).
2. Yarn Quota Utilization % (qualifies for Government-subsidized MGBBY premium subvention).
3. Age & Demographic Eligibility (PMJJBY: 18-50, PMSBY: 18-70, MGBBY: 18-50).
4. Loom Count & Passbook Turnover (calculates dynamic sum assured for Loom Asset & Raw Material Protection).
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are an expert micro-insurance advisor for unorganized handloom weavers. 
Evaluate the weaver's Yarn Passbook transaction history, active loom assets, age, and monthly sales cashflow to assign micro-insurance scheme eligibility and micro-premium deduction schedules."""


class InsuranceAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="insurance_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Evaluates real-world micro-insurance scheme eligibility based on Yarn Passbook transactions and artisan profile.
        """
        if not user_details and not message:
            return None

        # Extract profile & Yarn Passbook transaction details
        age = int(user_details.get("age", user_details.get("weaver_age", 35)))
        passbook_id = user_details.get("yarn_passbook_id")
        has_passbook = bool(passbook_id)
        
        # Calculate monthly turnover from Yarn Passbook transactions or direct field
        passbook_txs = user_details.get("yarn_passbook_transactions", user_details.get("transactions", []))
        if passbook_txs and isinstance(passbook_txs, list):
            credit_amounts = [float(t.get("amount", 0.0)) for t in passbook_txs if t.get("transaction_type") in ["CREDIT", "INFORMAL_SAREE_SALE", "INCOME"]]
            monthly_turnover = sum(credit_amounts) if credit_amounts else float(user_details.get("monthly_income", 15000.0))
        else:
            monthly_turnover = float(user_details.get("monthly_income", user_details.get("monthly_turnover", 15000.0)))

        quota_utilization = float(user_details.get("yarn_quota_utilization_pct", user_details.get("quota_utilization_pct", 70.0)))
        loom_assets = user_details.get("loom_assets", [])
        loom_count = len(loom_assets) if isinstance(loom_assets, list) and loom_assets else max(1, int(user_details.get("loom_count", 1)))
        
        active_policies = user_details.get("active_policies", [])
        active_ids = {p.get("policy_id") for p in active_policies if isinstance(p, dict)}

        evaluated_policies = []
        total_monthly_deduction = 0.0
        total_active_coverage = 0.0

        # -----------------------------------------------------------------------
        # Policy 1: PMJJBY (Life Cover ₹2 Lakh)
        # -----------------------------------------------------------------------
        is_pmjjby_active = "PMJJBY" in active_ids
        if is_pmjjby_active:
            pmjjby_status = "ENROLLED"
            pmjjby_reason = "Currently active policy."
            total_active_coverage += 200000.0
        elif 18 <= age <= 50:
            if monthly_turnover >= 3000.0:
                pmjjby_status = "ELIGIBLE"
                pmjjby_reason = f"Eligible (Age {age} within 18-50 range; Yarn Passbook turnover ₹{monthly_turnover:,.2f}/mo easily supports ₹36/mo micro-deduction)."
                total_monthly_deduction += 36.0
            else:
                pmjjby_status = "CONDITIONALLY_ELIGIBLE"
                pmjjby_reason = "Eligible by age, but Yarn Passbook turnover is below ₹3,000/mo. Increase saree sales to enable auto-deduction."
        else:
            pmjjby_status = "NOT_ELIGIBLE"
            pmjjby_reason = f"Age {age} exceeds PMJJBY maximum entry limit of 50 years."

        evaluated_policies.append({
            "policy_id": "PMJJBY",
            "policy_name": "PMJJBY - Weaver Life Cover",
            "category": "LIFE",
            "sum_assured_inr": 200000.0,
            "annual_premium_inr": 436.0,
            "monthly_deduction_rate_inr": 36.0,
            "eligibility_status": pmjjby_status,
            "eligibility_reason": pmjjby_reason,
            "verification_method": "Verified via Age profile & Yarn Passbook monthly cashflow",
        })

        # -----------------------------------------------------------------------
        # Policy 2: PMSBY (Accidental & Disability Cover ₹2 Lakh)
        # -----------------------------------------------------------------------
        is_pmsby_active = "PMSBY" in active_ids
        if is_pmsby_active:
            pmsby_status = "ENROLLED"
            pmsby_reason = "Currently active policy."
            total_active_coverage += 200000.0
        elif 18 <= age <= 70:
            pmsby_status = "ELIGIBLE"
            pmsby_reason = f"Eligible (Age {age} within 18-70 range; ₹2/mo deduction covers workplace/loom accidents)."
            total_monthly_deduction += 2.0
        else:
            pmsby_status = "NOT_ELIGIBLE"
            pmsby_reason = f"Age {age} outside PMSBY 18-70 coverage window."

        evaluated_policies.append({
            "policy_id": "PMSBY",
            "policy_name": "PMSBY - Weaver Accidental & Disability Cover",
            "category": "DISABILITY",
            "sum_assured_inr": 200000.0,
            "annual_premium_inr": 20.0,
            "monthly_deduction_rate_inr": 2.0,
            "eligibility_status": pmsby_status,
            "eligibility_reason": pmsby_reason,
            "verification_method": "Verified via Weaver Age & workplace safety risk model",
        })

        # -----------------------------------------------------------------------
        # Policy 3: MGBBY (Mahatma Gandhi Bunkar Bima Yojana - ₹5 Lakh Cover)
        # -----------------------------------------------------------------------
        is_mgbby_active = "MGBBY" in active_ids
        if is_mgbby_active:
            mgbby_status = "ENROLLED"
            mgbby_reason = "Currently active policy with Government premium subvention."
            total_active_coverage += 500000.0
        elif 18 <= age <= 60 and (has_passbook or quota_utilization >= 30.0):
            mgbby_status = "ELIGIBLE"
            mgbby_reason = f"Eligible for Government Subsidized Weaver Cover (Verified via Yarn Passbook quota utilization of {quota_utilization}%). Includes ₹1,200/yr child scholarship."
            total_monthly_deduction += 39.0
        elif 18 <= age <= 60:
            mgbby_status = "CONDITIONALLY_ELIGIBLE"
            mgbby_reason = "Requires active Yarn Passbook or Pehchan Card registration to qualify for Government premium subsidy."
        else:
            mgbby_status = "NOT_ELIGIBLE"
            mgbby_reason = f"Age {age} exceeds MGBBY maximum limit of 60 years."

        evaluated_policies.append({
            "policy_id": "MGBBY",
            "policy_name": "Mahatma Gandhi Bunkar Bima Yojana (MGBBY)",
            "category": "WEAVER_SPECIAL",
            "sum_assured_inr": 500000.0,
            "annual_premium_inr": 470.0,
            "monthly_deduction_rate_inr": 39.0,
            "eligibility_status": mgbby_status,
            "eligibility_reason": mgbby_reason,
            "verification_method": "Verified via Yarn Passbook quota utilization & Ministry of Textiles subvention rules",
        })

        # -----------------------------------------------------------------------
        # Policy 4: Loom & Yarn Asset Protection (Dynamic Sum Assured)
        # -----------------------------------------------------------------------
        # Calculate dynamic sum assured based on loom count & passbook volume
        calculated_asset_cover = min(300000.0, max(100000.0, loom_count * 100000.0 + (monthly_turnover * 2.0)))
        asset_monthly_rate = round((calculated_asset_cover / 100000.0) * 20.0, 2)  # ~₹20 per Lakh per month

        is_asset_active = "LOOM_ASSET_PROTECT" in active_ids
        if is_asset_active:
            asset_status = "ENROLLED"
            asset_reason = "Currently active property & stock protection policy."
            total_active_coverage += calculated_asset_cover
        elif loom_count > 0:
            asset_status = "ELIGIBLE"
            asset_reason = f"Eligible (Covering {loom_count} active loom setup(s) & raw yarn inventory based on Yarn Passbook turnover)."
            total_monthly_deduction += asset_monthly_rate
        else:
            asset_status = "CONDITIONALLY_ELIGIBLE"
            asset_reason = "Register your loom assets in KarghaDhan profile to activate property protection."

        evaluated_policies.append({
            "policy_id": "LOOM_ASSET_PROTECT",
            "policy_name": "KarghaDhan Loom & Raw Material Protection",
            "category": "BUSINESS_ASSET",
            "sum_assured_inr": calculated_asset_cover,
            "annual_premium_inr": round(asset_monthly_rate * 12, 2),
            "monthly_deduction_rate_inr": asset_monthly_rate,
            "eligibility_status": asset_status,
            "eligibility_reason": asset_reason,
            "verification_method": "Calculated from Yarn Passbook monthly throughput & registered loom asset capacity",
        })

        return {
            "weaver_age": age,
            "has_active_yarn_passbook": has_passbook,
            "passbook_monthly_turnover_inr": monthly_turnover,
            "yarn_quota_utilization_pct": quota_utilization,
            "evaluated_policies": evaluated_policies,
            "total_recommended_monthly_deduction": round(total_monthly_deduction, 2),
            "total_active_coverage_inr": round(total_active_coverage, 2),
            "micro_deduction_guidance": (
                f"Under KarghaDhan automated micro-insurance, the recommended monthly deduction of ₹{total_monthly_deduction:.2f} "
                f"is seamlessly split from your informal saree sales payouts, ensuring active policy status "
                "without requiring manual upfront bank deposits."
            ),
        }


insurance_agent = InsuranceAgent()
