"""
app/services/credit_scoring.py
Institutional-Grade Alternative Credit Scoring Model for Handloom Weavers (KarghaDhan KACS Model).

Mathematical Standard:
- Range: 300 to 900 (aligned with RBI-regulated Credit Information Companies - TransUnion CIBIL, CRIF High Mark, Equifax).
- Multi-factor Logistic Default Risk Model evaluating Yarn Passbook telemetry, repayment history, order stability, vintage, and CIBIL bureau overlay.
"""
from __future__ import annotations

import math
from typing import Optional, Any, Dict, Tuple


def calculate_weaver_score(
    cibil_score: Optional[int],
    total_allocated_quota: float,
    total_utilized_quota: float,
    order_frequency_variance: float,
    avg_ticket_size_inr: float,
    past_due_instances: int,
    experience_years: int = 5,
) -> Tuple[int, str, Dict[str, Any]]:
    """
    Evaluates default risk using the KarghaDhan Alternative Credit Score (KACS) institutional framework.

    Parameters:
      - cibil_score: Formal CIBIL score if available (300-900), or None for unbanked/NTC weavers.
      - total_allocated_quota: Allocated yarn quota in kg/metres from Yarn Passbook.
      - total_utilized_quota: Utilized yarn quota in kg/metres from Yarn Passbook.
      - order_frequency_variance: Variance / Standard Deviation in days of informal order frequency.
      - avg_ticket_size_inr: Average informal saree sale payout or ticket size in INR.
      - past_due_instances: Days Past Due (DPD) / missed payment count.
      - experience_years: Weaving experience in years.

    Returns:
      (credit_score, risk_tier, detailed_breakdown_dict)
    """
    # ---------------------------------------------------------------------------
    # Factor 1: Repayment Track Record & Delinquency Score (Weight: 35%)
    # ---------------------------------------------------------------------------
    dpd_clamped = min(max(0, past_due_instances), 5)
    s_repay = 100.0 * (1.0 - (dpd_clamped / 5.0))

    # ---------------------------------------------------------------------------
    # Factor 2: Yarn Quota & Enterprise Capacity Utilization (Weight: 30%)
    # ---------------------------------------------------------------------------
    if total_allocated_quota > 0:
        quota_ratio = total_utilized_quota / total_allocated_quota
        s_util = min(100.0, max(0.0, quota_ratio * 100.0))
    else:
        s_util = 50.0  # Neutral default for newly registered looms

    # ---------------------------------------------------------------------------
    # Factor 3: Sales Cashflow & Order Book Stability (Weight: 15%)
    # ---------------------------------------------------------------------------
    variance_norm = min(1.0, max(0.0, order_frequency_variance / 30.0))
    s_stability = 100.0 * (1.0 - variance_norm)

    # ---------------------------------------------------------------------------
    # Factor 4: Artisan Vintage & Heritage Experience (Weight: 10%)
    # ---------------------------------------------------------------------------
    exp_clamped = min(max(0, experience_years), 15)
    s_vintage = (exp_clamped / 15.0) * 100.0

    # ---------------------------------------------------------------------------
    # Factor 5: Formal Bureau Overlay / NTC Imputation (Weight: 10%)
    # ---------------------------------------------------------------------------
    if cibil_score is not None and cibil_score >= 300:
        cibil_clamped = min(max(300, cibil_score), 900)
        s_bureau = ((cibil_clamped - 300) / 600.0) * 100.0
        is_ntc = False
    else:
        s_bureau = 50.0  # Neutral imputation for No-Time-to-Credit (NTC)
        is_ntc = True

    # ---------------------------------------------------------------------------
    # Total Weighted Raw Score Calculation (S_raw in [0, 100])
    # ---------------------------------------------------------------------------
    w_repay = 0.35
    w_util = 0.30
    w_stability = 0.15
    w_vintage = 0.10
    w_bureau = 0.10

    s_raw = (
        w_repay * s_repay
        + w_util * s_util
        + w_stability * s_stability
        + w_vintage * s_vintage
        + w_bureau * s_bureau
    )

    # ---------------------------------------------------------------------------
    # Logistic Log-Odds Mapping to Probability of Default (PD)
    # ---------------------------------------------------------------------------
    alpha = 2.2
    beta = 4.4
    z = alpha - beta * (s_raw / 100.0)

    p_default = 1.0 / (1.0 + math.exp(z))

    # Map (1 - PD) to 300-900 Scale
    credit_score = int(round(300.0 + 600.0 * (1.0 - p_default)))
    credit_score = min(max(300, credit_score), 900)

    # ---------------------------------------------------------------------------
    # Official Institutional Risk Tier & Scheme Policy Matrix
    # ---------------------------------------------------------------------------
    if credit_score >= 750:
        risk_tier = "Excellent"
        risk_grade = "Tier 1 - Prime Risk"
        max_micro_loan = 300000.0
        subvention_rate = 5.0
        eligible_schemes = [
            "PM Vishwakarma Scheme (Tranche 2 - ₹2 Lakh @ 5%)",
            "Weaver Mudra Scheme (₹2 Lakh @ 6% Subvention + ₹10,000 Margin Money)",
            "Mahatma Gandhi Bunkar Bima Yojana (MGBBY ₹5 Lakh Cover)",
            "NHDP 15% Yarn Price Subvention & Doorstep Freight Subsidy",
        ]
    elif credit_score >= 650:
        risk_tier = "Good"
        risk_grade = "Tier 2 - Low Risk"
        max_micro_loan = 150000.0
        subvention_rate = 6.0
        eligible_schemes = [
            "PM Vishwakarma Scheme (Tranche 1 - ₹1 Lakh @ 5%)",
            "Weaver Mudra Scheme (₹1.5 Lakh @ 6% Subvention)",
            "PMJJBY (Life Cover ₹2 Lakh @ ₹36/mo)",
            "PMSBY (Disability Cover ₹2 Lakh @ ₹2/mo)",
            "NHDP 15% Yarn Price Subvention",
        ]
    elif credit_score >= 550:
        risk_tier = "Average"
        risk_grade = "Tier 3 - Moderate Risk"
        max_micro_loan = 50000.0
        subvention_rate = 7.5
        eligible_schemes = [
            "Weaver Mudra Micro-Credit (Up to ₹50,000 with Joint Guarantor / JLG)",
            "SAMARTH Skill Training & Loom Capacity Upgrade",
            "PMJJBY & PMSBY Micro-Insurance Shield",
            "NHDP Raw Material Passbook Registration",
        ]
    else:
        risk_tier = "Risky"
        risk_grade = "Tier 4 - Vulnerable / High Risk"
        max_micro_loan = 25000.0
        subvention_rate = 9.5
        eligible_schemes = [
            "Self Help Group (SHG) / JLG Micro-Finance (Up to ₹25,000)",
            "PMSBY Accidental Protection (₹2/mo)",
            "SAMARTH Basic Weaving Skill Development",
        ]

    factor_breakdown = {
        "scoring_model": "KarghaDhan Alternative Credit Score (KACS v2.0 - RBI Aligned)",
        "score_range": "300 - 900",
        "calculated_score": credit_score,
        "risk_tier": risk_tier,
        "risk_grade": risk_grade,
        "probability_of_default_pct": round(p_default * 100.0, 2),
        "is_no_time_to_credit_ntc": is_ntc,
        "cibil_score_input": cibil_score,
        "max_eligible_micro_loan_inr": max_micro_loan,
        "concessional_interest_rate_pct": subvention_rate,
        "factor_scores": {
            "repayment_history_score_35pct": round(s_repay, 2),
            "quota_capacity_utilization_score_30pct": round(s_util, 2),
            "order_cashflow_stability_score_15pct": round(s_stability, 2),
            "artisan_experience_vintage_score_10pct": round(s_vintage, 2),
            "formal_bureau_overlay_score_10pct": round(s_bureau, 2),
        },
        "weighted_raw_score": round(s_raw, 2),
        "logistic_log_odds_z": round(z, 4),
        "institutional_eligible_schemes": eligible_schemes,
    }

    return credit_score, risk_tier, factor_breakdown
