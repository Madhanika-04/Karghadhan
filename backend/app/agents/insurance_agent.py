"""
app/agents/insurance_agent.py
Insurance Agent for KarghaDhan.
Selects health, life, disability, and business/asset insurance options (PMJJBY, PMSBY, MGBBY, Weaver Asset Protection), explains recommendations and micro-premium deductions.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are an expert micro-insurance advisor for unorganized handloom weavers. 
Recommend government life, disability, health, and loom asset insurance policies with micro-premium deduction schedules."""

INSURANCE_CATALOG = [
    {
        "policy_id": "PMJJBY",
        "policy_name": "PMJJBY - Weaver Life Cover",
        "category": "LIFE",
        "sum_assured": 200000.0,
        "annual_premium": 436.0,
        "monthly_deduction_rate": 36.0,
        "target_age_range": "18 - 50 years",
        "description": "Life insurance coverage payable to beneficiary upon death due to any cause.",
        "why_recommended": "Essential life security for primary earner in unorganized weaver households.",
    },
    {
        "policy_id": "PMSBY",
        "policy_name": "PMSBY - Weaver Disability Cover",
        "category": "DISABILITY",
        "sum_assured": 200000.0,
        "annual_premium": 20.0,
        "monthly_deduction_rate": 2.0,
        "target_age_range": "18 - 70 years",
        "description": "Accidental death and permanent disability insurance coverage.",
        "why_recommended": "Ultra-low cost (₹2/mo) protection against loom/workplace accidents and physical injury.",
    },
    {
        "policy_id": "MGBBY",
        "policy_name": "Mahatma Gandhi Bunkar Bima Yojana (MGBBY)",
        "category": "WEAVER_SPECIAL",
        "sum_assured": 500000.0,
        "annual_premium": 470.0,
        "monthly_deduction_rate": 39.0,
        "target_age_range": "18 - 60 years",
        "description": "Specialized weaver insurance including natural death, accidental death, disability, and scholarship support for weaver children.",
        "why_recommended": "Comprehensive handloom sector insurance with government premium subvention.",
    },
    {
        "policy_id": "LOOM_ASSET_PROTECT",
        "policy_name": "KarghaDhan Loom & Yarn Protection",
        "category": "BUSINESS_ASSET",
        "sum_assured": 150000.0,
        "annual_premium": 360.0,
        "monthly_deduction_rate": 30.0,
        "target_age_range": "All active weavers",
        "description": "Property & asset insurance covering handlooms, jacquard setups, raw yarn stock, and finished sarees against fire, flood, and theft.",
        "why_recommended": "Protects your primary capital asset (looms and stored yarn) against unexpected disasters.",
    },
]


class InsuranceAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="insurance_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic recommendation of insurance policies for weavers.
        """
        if not user_details and not message:
            return None

        active_policies = user_details.get("active_policies", [])
        active_ids = {p.get("policy_id") for p in active_policies if isinstance(p, dict)}

        recommended = []
        total_monthly_deduction = 0.0

        for pol in INSURANCE_CATALOG:
            is_active = pol["policy_id"] in active_ids
            recommended.append({
                "policy_id": pol["policy_id"],
                "policy_name": pol["policy_name"],
                "category": pol["category"],
                "sum_assured_inr": pol["sum_assured"],
                "annual_premium_inr": pol["annual_premium"],
                "monthly_deduction_rate_inr": pol["monthly_deduction_rate"],
                "is_currently_enrolled": is_active,
                "why_recommended": pol["why_recommended"],
                "description": pol["description"],
            })

            if not is_active:
                total_monthly_deduction += pol["monthly_deduction_rate"]

        return {
            "recommended_policies": recommended,
            "total_recommended_monthly_deduction": round(total_monthly_deduction, 2),
            "micro_deduction_guidance": (
                "Under KarghaDhan automated micro-insurance, premium slices are automatically "
                "deducted from incoming informal saree sales (e.g. ₹36/mo for PMJJBY), "
                "ensuring policy active status without manual lump-sum bank deposits."
            ),
        }


insurance_agent = InsuranceAgent()
