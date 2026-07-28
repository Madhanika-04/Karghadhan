"""
app/agents/scheme_agent.py
Scheme Agent for KarghaDhan.
Recommends government, MSME, and Ministry of Textiles schemes tailored for handloom weavers (PM Vishwakarma, Weaver Mudra, SAMARTH, NHDP Yarn Supply Scheme, etc.).
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are an expert on Indian Government and MSME schemes for handloom weavers and textile artisans. 
Recommend relevant schemes, explain benefits, eligibility criteria, and step-by-step application guidance."""

SCHEMES_CATALOG = [
    {
        "id": "PM_VISHWAKARMA",
        "name": "PM Vishwakarma Scheme",
        "category": "Artisan Credit & Skill",
        "max_financial_benefit": "₹3,00,000 collateral-free loan @ 5% interest",
        "key_benefits": [
            "Collateral-free enterprise credit (Tranche 1: ₹1 Lakh, Tranche 2: ₹2 Lakh)",
            "5% concessional interest rate with 8% interest subvention by GoI",
            "Skill verification & ₹15,000 toolkit incentive",
            "Digital transaction incentive (₹1 per transaction up to 100/mo)",
        ],
        "eligibility_criteria": "Artisans engaged in weaving/craft work with Pehchan ID or trade verification.",
        "min_experience_years": 1,
    },
    {
        "id": "WEAVER_MUDRA",
        "name": "Weaver Mudra Scheme",
        "category": "Micro-Credit Subvention",
        "max_financial_benefit": "₹2,00,000 loan with 6% interest subvention",
        "key_benefits": [
            "Concessional credit at 6% interest rate",
            "Margin money assistance up to 20% of loan amount (max ₹10,000)",
            "Credit guarantee cover through CGTMSE for 3 years",
            "Yarn Passbook & Mudra Rupay Card for raw material purchase",
        ],
        "eligibility_criteria": "Handloom weavers holding Weaver Pehchan Card or registered with weavers co-op.",
        "min_experience_years": 2,
    },
    {
        "id": "NHDP_YARN_SUPPLY",
        "name": "NHDP - Raw Material / Yarn Supply Scheme",
        "category": "Raw Material Subsidy",
        "max_financial_benefit": "15% yarn price subvention",
        "key_benefits": [
            "15% subsidy on cotton, silk, and wool yarn purchases",
            "Direct freight reimbursement to weaver doorstep/depot",
            "Yarn Passbook digital tracking and credit integration",
        ],
        "eligibility_criteria": "Individual weavers, SHGs, and weavers societies with active Yarn Passbook.",
        "min_experience_years": 0,
    },
    {
        "id": "SAMARTH",
        "name": "SAMARTH (Scheme for Capacity Building in Textile Sector)",
        "category": "Skill Training & Upgrading",
        "max_financial_benefit": "Free training + stipend during upgrade",
        "key_benefits": [
            "Free Jacquard / Dobby loom technical training",
            "Stipend during training period",
            "Placement & market linkage support with master weavers & exporters",
        ],
        "eligibility_criteria": "Weavers looking to upgrade traditional skill or switch to Jacquard looms.",
        "min_experience_years": 0,
    },
]


class SchemeAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="scheme_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic matching of user profile to eligible schemes.
        """
        if not user_details and not message:
            return None

        exp_years = int(user_details.get("experience_years", 3))
        has_pehchan = bool(user_details.get("pehchan_id"))
        has_passbook = bool(user_details.get("yarn_passbook_id"))

        recommended_schemes = []
        for scheme in SCHEMES_CATALOG:
            if exp_years >= scheme["min_experience_years"]:
                reason = f"Matched based on {exp_years} years of weaving experience"
                if scheme["id"] == "NHDP_YARN_SUPPLY" and has_passbook:
                    reason += " and active Yarn Passbook ID."
                elif scheme["id"] == "WEAVER_MUDRA" and has_pehchan:
                    reason += " and verified Weaver Pehchan Card."

                recommended_schemes.append({
                    "scheme_id": scheme["id"],
                    "scheme_name": scheme["name"],
                    "category": scheme["category"],
                    "financial_benefit": scheme["max_financial_benefit"],
                    "key_benefits": scheme["key_benefits"],
                    "eligibility_reason": reason,
                    "next_steps": f"Submit application via KarghaDhan digital portal or visit nearest Weavers Service Centre (WSC).",
                })

        return {
            "total_eligible_schemes": len(recommended_schemes),
            "recommended_schemes": recommended_schemes,
            "application_guidance": "KarghaDhan assists in pre-filling application documents directly using your verified Pehchan profile.",
        }


scheme_agent = SchemeAgent()
