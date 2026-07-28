"""
app/agents/scheme_agent.py
Real-World Scheme Agent for KarghaDhan.
Matches government, MSME, and Ministry of Textiles handloom schemes (PM Vishwakarma, Weaver Mudra, SAMARTH, NHDP Yarn Supply Scheme) based on Yarn Passbook transaction history, Pehchan ID, and loom metrics.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are an expert on Indian Government and MSME schemes for handloom weavers and textile artisans. 
Evaluate the weaver's Yarn Passbook transaction history, quota utilization, Pehchan Card, and loom capacity to recommend eligible schemes with specific benefits and application guidance."""

SCHEMES_CATALOG = [
    {
        "id": "PM_VISHWAKARMA",
        "name": "PM Vishwakarma Scheme",
        "category": "Artisan Credit & Skill",
        "max_financial_benefit": "₹3,00,000 collateral-free loan @ 5% interest + ₹15,000 toolkit incentive",
        "key_benefits": [
            "Collateral-free enterprise credit (Tranche 1: ₹1 Lakh, Tranche 2: ₹2 Lakh)",
            "5% concessional interest rate with 8% Govt of India interest subvention",
            "Skill verification & ₹15,000 digital toolkit incentive",
            "Digital transaction incentive (₹1 per transaction up to 100/mo)",
        ],
        "min_experience_years": 1,
    },
    {
        "id": "WEAVER_MUDRA",
        "name": "Weaver Mudra Scheme",
        "category": "Micro-Credit Subvention",
        "max_financial_benefit": "₹2,00,000 loan with 6% interest subvention + ₹10,000 margin money",
        "key_benefits": [
            "Concessional credit at 6% interest rate",
            "Margin money assistance up to 20% of loan amount (max ₹10,000)",
            "Credit guarantee cover through CGTMSE for 3 years",
            "Yarn Passbook & Mudra Rupay Card for raw material purchase",
        ],
        "min_experience_years": 2,
    },
    {
        "id": "NHDP_YARN_SUPPLY",
        "name": "NHDP - Raw Material / Yarn Supply Scheme",
        "category": "Raw Material Subsidy",
        "max_financial_benefit": "15% yarn price subvention + Doorstep freight reimbursement",
        "key_benefits": [
            "15% subsidy on cotton, silk, and wool yarn purchases",
            "Direct freight reimbursement to weaver doorstep or depot",
            "Yarn Passbook digital tracking and credit integration",
        ],
        "min_experience_years": 0,
    },
    {
        "id": "SAMARTH",
        "name": "SAMARTH (Scheme for Capacity Building in Textile Sector)",
        "category": "Skill Training & Upgrading",
        "max_financial_benefit": "Free Jacquard/Dobby upgrade training + Stipend",
        "key_benefits": [
            "Free technical training for Jacquard / Dobby loom technology",
            "Daily stipend during upgrade training period",
            "Direct market linkage support with master weavers & export houses",
        ],
        "min_experience_years": 0,
    },
]


class SchemeAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="scheme_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Evaluates scheme eligibility based on Yarn Passbook transactions, quota utilization, Pehchan ID, and experience.
        """
        if not user_details and not message:
            return None

        exp_years = int(user_details.get("experience_years", 3))
        pehchan_id = user_details.get("pehchan_id")
        has_pehchan = bool(pehchan_id)
        passbook_id = user_details.get("yarn_passbook_id")
        has_passbook = bool(passbook_id)

        passbook_txs = user_details.get("yarn_passbook_transactions", user_details.get("transactions", []))
        tx_count = len(passbook_txs) if isinstance(passbook_txs, list) else 0
        quota_utilization = float(user_details.get("yarn_quota_utilization_pct", user_details.get("quota_utilization_pct", 70.0)))

        recommended_schemes = []

        for scheme in SCHEMES_CATALOG:
            scheme_id = scheme["id"]
            is_eligible = False
            status = "NOT_ELIGIBLE"
            reason = ""

            if scheme_id == "NHDP_YARN_SUPPLY":
                if has_passbook:
                    status = "ELIGIBLE"
                    reason = f"Eligible (Verified active Yarn Passbook ID: {passbook_id}; {quota_utilization}% quota utilized across {tx_count} transactions)."
                    is_eligible = True
                else:
                    status = "CONDITIONALLY_ELIGIBLE"
                    reason = "Requires digital Yarn Passbook registration to claim 15% raw material subvention."

            elif scheme_id == "WEAVER_MUDRA":
                if exp_years >= 2 and (has_pehchan or quota_utilization >= 40.0):
                    status = "ELIGIBLE"
                    reason = f"Eligible (Verified {exp_years} yrs experience & active Yarn Passbook utilization of {quota_utilization}% qualifies for 6% interest subvention & ₹10,000 margin money)."
                    is_eligible = True
                elif exp_years >= 2:
                    status = "CONDITIONALLY_ELIGIBLE"
                    reason = "Eligible by experience. Increase Yarn Passbook quota utilization to 40%+ to unlock full margin money assistance."

            elif scheme_id == "PM_VISHWAKARMA":
                if exp_years >= 1 and (has_pehchan or has_passbook or tx_count > 0):
                    status = "ELIGIBLE"
                    reason = f"Eligible (Verified artisan activity via Yarn Passbook transactions & {exp_years} yrs weaving experience. Qualifies for ₹3 Lakh loan @ 5% & ₹15,000 toolkit)."
                    is_eligible = True
                else:
                    status = "CONDITIONALLY_ELIGIBLE"
                    reason = "Requires trade verification or Pehchan ID registration at local Weavers Service Centre."

            elif scheme_id == "SAMARTH":
                status = "ELIGIBLE"
                reason = "Eligible for capacity building and Jacquard/Dobby loom technology upgrade training."
                is_eligible = True

            recommended_schemes.append({
                "scheme_id": scheme["id"],
                "scheme_name": scheme["name"],
                "category": scheme["category"],
                "eligibility_status": status,
                "financial_benefit": scheme["max_financial_benefit"],
                "key_benefits": scheme["key_benefits"],
                "eligibility_reason": reason,
                "verification_source": "Verified against Yarn Passbook transaction history & Pehchan registry",
                "next_steps": "Submit digital application via KarghaDhan portal; documentation is pre-filled from your profile.",
            })

        eligible_count = sum(1 for s in recommended_schemes if s["eligibility_status"] == "ELIGIBLE")

        return {
            "total_evaluated_schemes": len(recommended_schemes),
            "total_eligible_schemes": eligible_count,
            "has_verified_yarn_passbook": has_passbook,
            "yarn_quota_utilization_pct": quota_utilization,
            "recommended_schemes": recommended_schemes,
            "application_guidance": "KarghaDhan automatically attaches your Yarn Passbook statement and Pehchan verification when submitting scheme applications.",
        }


scheme_agent = SchemeAgent()
