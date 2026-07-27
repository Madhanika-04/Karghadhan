"""
app/services/credit_scoring.py
Algorithmic credit scoring pipeline for alternative underwriting of handloom weavers.
"""
from __future__ import annotations

import math
from typing import Optional

def calculate_weaver_score(
    cibil_score: Optional[int],
    total_allocated_quota: float,
    total_utilized_quota: float,
    order_frequency_variance: float,
    avg_ticket_size_inr: float,
    past_due_instances: int
) -> tuple[int, str]:
    """
    Evaluates default risk and returns a Weaver Credit Score (300-900)
    and corresponding risk tier.
    
    Implements normalization, imputation, and logistic log-odds mapping.
    """
    
    # 1. CIBIL Score normalization and missing imputation
    if cibil_score is not None:
        # Scale 300-900 to 0.0-1.0
        cibil_score_clamped = max(300, min(900, cibil_score))
        X_cibil = (cibil_score_clamped - 300) / 600.0
        I_cibil_missing = 0.0
    else:
        # Impute with average baseline and set missing indicator
        X_cibil = 0.5
        I_cibil_missing = 1.0

    # 2. Yarn Quota Utilization
    if total_allocated_quota > 0:
        quota_ratio = total_utilized_quota / total_allocated_quota
        X_util = max(0.0, min(1.0, quota_ratio))
    else:
        X_util = 0.5  # Neutral default

    # 3. Order Frequency Variance (soft-capped std dev in days, logs)
    # Variance is standard deviation here as requested. Let's cap std dev of 30 days.
    X_var = max(0.0, min(1.0, order_frequency_variance / 30.0))

    # 4. Average Ticket Size (INR capped at 50,000)
    X_ticket = max(0.0, min(1.0, avg_ticket_size_inr / 50000.0))

    # 5. Past Due Instances (capped at 5)
    X_pdu = max(0.0, min(1.0, past_due_instances / 5.0))

    # 6. Logistic Regression weights for risk log-odds z
    # Intercept
    beta_0 = 0.5
    # Coefficients
    beta_cibil = -2.5       # High CIBIL reduces default probability
    beta_missing = 0.5      # Missing CIBIL increases risk slightly
    beta_util = -1.2        # Active utilization reduces risk
    beta_var = 1.8          # High inconsistency of orders increases risk
    beta_ticket = -1.0      # Higher ticket size decreases risk
    beta_pdu = 3.5          # Past due instances heavily increase risk

    # Calculate log-odds z
    z = (
        beta_0
        + beta_cibil * X_cibil
        + beta_missing * I_cibil_missing
        + beta_util * X_util
        + beta_var * X_var
        + beta_ticket * X_ticket
        + beta_pdu * X_pdu
    )

    # Sigmoid function for probability of default P
    p_default = 1.0 / (1.0 + math.exp(-z))

    # Map probability of default to score [300, 900]
    # P=0 -> Score = 900 (Excellent)
    # P=1 -> Score = 300 (High Risk)
    credit_score = int(300 + ((1.0 - p_default) * 600.0))
    credit_score = max(300, min(900, credit_score))

    # 7. Risk Tier rating classification
    if credit_score >= 750:
        risk_tier = "Excellent"
    elif credit_score >= 650:
        risk_tier = "Good"
    elif credit_score >= 550:
        risk_tier = "Average"
    else:
        risk_tier = "Risky"

    return credit_score, risk_tier
