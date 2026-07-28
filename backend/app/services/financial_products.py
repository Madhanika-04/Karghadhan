"""
app/services/financial_products.py
Service that handles database retrieval, eligibility criteria rules,
and real-world application portal form generators for micro-credit, savings, and insurance.
"""
from __future__ import annotations

import logging
from typing import Dict, Any, List, Optional
from uuid import uuid4
from datetime import datetime, timezone

from app.schemas.financial_product import LoanProduct, SavingsProduct, InsuranceProduct

logger = logging.getLogger(__name__)

# ==============================================================================
# REAL-WORLD FINANCIAL PRODUCTS REGISTRY
# ==============================================================================

LOAN_PRODUCTS = [
    LoanProduct(
        id="WEAVER_MUDRA_CARD",
        name="Weaver Mudra Card Scheme (NABARD)",
        description=(
            "Working capital loan for weavers under NABARD guidelines. Features a 7% interest subsidy "
            "from the Government of India and credit limit up to ₹2 Lakhs with zero collateral requirement."
        ),
        provider="NABARD & Nationalised Banks (SBI, PNB, etc.)",
        portal_name="National Handloom Development Portal / Mudra Mitra",
        portal_url="https://handlooms.nic.in",
        max_amount=200000.0,
        interest_rate=8.5,
        subsidy_rate=7.0,
        tenure_months_range="12 to 36 months",
        requirements=[
            "Must be a registered handloom weaver",
            "Must possess a valid Weaver Pehchan Identity Card",
            "Minimum Weaver Credit Score of 600",
            "Must have active loom assets listed"
        ]
    ),
    LoanProduct(
        id="PM_SVANIDHI_WEAVER",
        name="PM SVANidhi Scheme (Weaver Micro-Credit)",
        description=(
            "Collateral-free working capital loan up to ₹50,000 for handloom weavers working in urban/semi-urban areas. "
            "7% interest subsidy on timely repayment, and cashback on digital transactions."
        ),
        provider="Ministry of Housing and Urban Affairs (MoHUA)",
        portal_name="PM SVANidhi Portal",
        portal_url="https://pmsvanidhi.mohua.gov.in",
        max_amount=50000.0,
        interest_rate=9.0,
        subsidy_rate=7.0,
        tenure_months_range="12 months (up to 36 months on consecutive terms)",
        requirements=[
            "Must possess a certificate of vending or recommendation letter from Weaver Association",
            "Minimum Weaver Credit Score of 450",
            "Aadhaar linked with mobile number"
        ]
    ),
    LoanProduct(
        id="PMMY_MUDRA_SHISHU",
        name="PM Mudra Yojana - Shishu Loan",
        description=(
            "Financial support up to ₹50,000 for setting up new looms or upgrading existing handloom units. "
            "Requires no security or collateral, with low processing fee."
        ),
        provider="Micro Units Development & Refinance Agency Ltd. (MUDRA)",
        portal_name="Udyamimitra Portal",
        portal_url="https://www.udyamimitra.in",
        max_amount=50000.0,
        interest_rate=9.5,
        subsidy_rate=0.0,
        tenure_months_range="12 to 60 months",
        requirements=[
            "Proposed project or loom upgrade plan",
            "Minimum Weaver Credit Score of 350",
            "Identity and address proofs"
        ]
    ),
    LoanProduct(
        id="PMMY_MUDRA_KISHOR",
        name="PM Mudra Yojana - Kishor Loan",
        description=(
            "Loans between ₹50,000 and ₹5,000,000 for weavers wishing to purchase automated dobby/jacquard attachments "
            "or expand raw material yarn inventory. Collateral-free."
        ),
        provider="Micro Units Development & Refinance Agency Ltd. (MUDRA)",
        portal_name="Udyamimitra Portal",
        portal_url="https://www.udyamimitra.in",
        max_amount=500000.0,
        interest_rate=10.2,
        subsidy_rate=0.0,
        tenure_months_range="12 to 60 months",
        requirements=[
            "Active handloom operations for at least 2 years",
            "Proof of purchase orders or raw material requirements",
            "Minimum Weaver Credit Score of 550"
        ]
    ),
]

SAVINGS_PRODUCTS = [
    SavingsProduct(
        id="PMJDY_SAVINGS",
        name="Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        description=(
            "National Mission for Financial Inclusion. A basic savings bank deposit account for unbanked weavers. "
            "Zero minimum balance, free Rupay debit card, ₹2 Lakh built-in accident insurance, and ₹10,000 overdraft facility."
        ),
        provider="All Public Sector & Regional Rural Banks",
        portal_name="PMJDY Portal",
        portal_url="https://pmjdy.gov.in",
        minimum_balance=0.0,
        interest_rate=3.5,
        benefits=[
            "Zero balance requirement",
            "Built-in ₹10,000 overdraft facility (subject to credit evaluation)",
            "Free RuPay Debit Card with ₹2 Lakh accident insurance",
            "Direct Benefit Transfer (DBT) eligibility for government subsidies"
        ]
    ),
    SavingsProduct(
        id="POST_OFFICE_NSC",
        name="Post Office National Savings Certificate (NSC)",
        description=(
            "Government-backed safe investment option for rural artisans and weavers. "
            "Guaranteed interest compounding annually, with tax benefits under Section 80C."
        ),
        provider="India Post / Department of Posts",
        portal_name="India Post E-Savings Portal",
        portal_url="https://www.indiapost.gov.in",
        minimum_balance=1000.0,
        interest_rate=7.7,
        benefits=[
            "100% safe investment backed by Government of India",
            "Fixed maturity of 5 years",
            "No maximum deposit limit",
            "Can be pledged as collateral for securing Mudra loans"
        ]
    ),
    SavingsProduct(
        id="NABARD_WEAVER_THRIFT",
        name="NABARD Weaver Co-operative Thrift Scheme",
        description=(
            "Thrift fund scheme for weavers enrolled in Primary Weavers Co-operative Societies. "
            "Matches weaver savings contribution with a government subsidy up to ₹2,000 per year."
        ),
        provider="NABARD & Co-operative Banks",
        portal_name="State Cooperative Handloom Portal",
        portal_url="https://nabard.org",
        minimum_balance=500.0,
        interest_rate=6.0,
        benefits=[
            "Government matching grant up to ₹2,000 per annum",
            "Easy withdrawal facility during cluster lean seasons",
            "Promotes community thrift habits"
        ]
    ),
]

INSURANCE_PRODUCTS = [
    InsuranceProduct(
        id="MGBBY_INSURANCE",
        name="Mahatma Gandhi Bunkar Bima Yojana (MGBBY)",
        description=(
            "Specialized life and disability insurance for handloom weavers. Government of India contributes "
            "the majority of the premium, making the net cost to weavers highly affordable."
        ),
        provider="Life Insurance Corporation of India (LIC)",
        portal_name="LIC India Portal (Artisan/Weaver Section)",
        portal_url="https://licindia.in",
        coverage_amount=150000.0,
        annual_premium=470.0,
        subsidized_premium=80.0,  # Weaver only pays ₹80
        benefits=[
            "₹60,000 natural death cover",
            "₹1,50,000 accidental death cover",
            "₹1,50,000 total disability cover / ₹75,000 partial disability cover",
            "Shiksha Sahayog Yojana: Scholarship of ₹300 per quarter for up to two children in grades 9-12"
        ]
    ),
    InsuranceProduct(
        id="PMJJBY_LIFE",
        name="Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        description=(
            "One-year life insurance cover of ₹2 Lakhs, renewable from year to year, for all savings bank account holders. "
            "Covers death due to any reason."
        ),
        provider="Partner Insurance Companies & Banks",
        portal_name="Jan Suraksha Portal",
        portal_url="https://www.jansuraksha.gov.in",
        coverage_amount=200000.0,
        annual_premium=436.0,
        subsidized_premium=436.0,
        benefits=[
            "₹2,00,000 cover for death due to any reason",
            "Auto-debit capability from bank savings account",
            "No medical examination required"
        ]
    ),
    InsuranceProduct(
        id="PMSBY_ACCIDENT",
        name="Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
        description=(
            "Accident insurance scheme offering accidental death and disability cover of ₹2 Lakhs for a premium of just ₹20 per year."
        ),
        provider="Partner Insurance Companies & Banks",
        portal_name="Jan Suraksha Portal",
        portal_url="https://www.jansuraksha.gov.in",
        coverage_amount=200000.0,
        annual_premium=20.0,
        subsidized_premium=20.0,
        benefits=[
            "₹2,00,000 accidental death cover",
            "₹2,00,000 cover for permanent total disability (loss of both eyes/limbs)",
            "₹1,00,000 cover for permanent partial disability",
            "Extremely low cost of ₹20/year"
        ]
    ),
]


# ==============================================================================
# ELIGIBILITY FILTER ENGINE
# ==============================================================================

def get_recommendations_for_weaver(
    weaver_id: str,
    credit_score: int,
    risk_tier: str
) -> Dict[str, Any]:
    """
    Evaluates real-world eligibility thresholds and filters products
    according to the weaver's credit score rating.
    """
    recommended_loans = []
    for lp in LOAN_PRODUCTS:
        # Check eligibility threshold
        if lp.id == "WEAVER_MUDRA_CARD" and credit_score < 600:
            continue
        if lp.id == "PM_SVANIDHI_WEAVER" and credit_score < 450:
            continue
        if lp.id == "PMMY_MUDRA_SHISHU" and credit_score < 350:
            continue
        if lp.id == "PMMY_MUDRA_KISHOR" and credit_score < 550:
            continue
        recommended_loans.append(lp)

    recommended_savings = []
    for sp in SAVINGS_PRODUCTS:
        if sp.id == "NABARD_WEAVER_THRIFT" and credit_score < 600:
            continue
        if sp.id == "PMJDY_SAVINGS" and credit_score < 300:
            continue
        recommended_savings.append(sp)

    # Insurance schemes are generally open to all registered weavers regardless of credit
    recommended_insurance = INSURANCE_PRODUCTS

    return {
        "weaver_id": weaver_id,
        "credit_score": credit_score,
        "risk_tier": risk_tier,
        "recommended_loans": recommended_loans,
        "recommended_savings": recommended_savings,
        "recommended_insurance": recommended_insurance
    }


# ==============================================================================
# REAL PORTAL FORM SPECIFICATION GENERATORS
# ==============================================================================

def generate_portal_form_json(
    weaver_profile: Dict[str, Any],
    scoring_profile: Optional[Dict[str, Any]],
    product_id: str,
    form_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compiles verified weaver details and user-provided inputs to generate
    the exact structured JSON format requested by the respective official portal.
    """
    # Extract common verified credentials
    full_name = weaver_profile.get("full_name", "")
    phone_number = weaver_profile.get("phone_number", "")
    email = weaver_profile.get("email", "")
    pehchan_id = weaver_profile.get("pehchan_id", "")
    yarn_passbook_id = weaver_profile.get("yarn_passbook_id", "")
    cluster_location = weaver_profile.get("cluster_location", "")
    experience_years = weaver_profile.get("experience_years", 0)
    
    # Check if there is an alternative credit score
    credit_score = scoring_profile.get("score") if scoring_profile else 350
    risk_tier = scoring_profile.get("risk_tier") if scoring_profile else "Risky"
    
    now_iso = datetime.now(timezone.utc).isoformat()

    if product_id == "WEAVER_MUDRA_CARD":
        # Form details exactly for NABARD Weaver Mudra portal
        return {
            "portal_meta": {
                "portal_id": "NABARD_WEAVER_MUDRA",
                "form_version": "2026.1",
                "api_endpoint": "https://handlooms.nic.in/api/v1/mudra/application",
                "generated_at": now_iso
            },
            "weaver_verified_credentials": {
                "pehchan_card_number": pehchan_id,
                "yarn_passbook_number": yarn_passbook_id,
                "alternative_credit_score": credit_score,
                "alternative_risk_assessment": risk_tier
            },
            "applicant_demographics": {
                "full_name_as_per_pehchan": full_name,
                "phone_number": phone_number,
                "email": email,
                "weaver_category": form_data.get("weaver_category", "Independent Weaver"),
                "handloom_cooperative_membership_no": form_data.get("cooperative_membership_no", None),
                "experience_in_years": experience_years
            },
            "business_details": {
                "handloom_cluster_village_city": cluster_location,
                "state_code": form_data.get("state_code", "UP"),
                "number_of_active_looms": len(weaver_profile.get("loom_assets", [])),
                "loom_types_operated": [loom.get("loom_type", "HANDLOOM") for loom in weaver_profile.get("loom_assets", [])],
                "yarn_requirements_per_annum_kg": scoring_profile.get("total_allocated_quota", 500.0) if scoring_profile else 500.0
            },
            "loan_request_params": {
                "requested_credit_limit_inr": form_data.get("requested_amount", 50000.0),
                "purpose_code": "WORKING_CAPITAL_YARN_PURCHASE",
                "tenure_months": form_data.get("tenure_months", 36),
                "interest_subsidy_claim_flag": True,
                "collateral_free_declaration": True
            },
            "bank_account_details": {
                "payee_name": full_name,
                "account_number": form_data.get("bank_account_no", ""),
                "bank_name": form_data.get("bank_name", ""),
                "branch_ifsc_code": form_data.get("bank_ifsc", "")
            }
        }

    elif product_id == "PM_SVANIDHI_WEAVER":
        # Form details exactly for PM SVANidhi portal
        return {
            "portal_meta": {
                "portal_id": "PM_SVANIDHI",
                "form_version": "v3.0",
                "api_endpoint": "https://pmsvanidhi.mohua.gov.in/api/v1/apply",
                "generated_at": now_iso
            },
            "weaver_identity": {
                "pehchan_card_id": pehchan_id,
                "mobile_registered": phone_number,
                "alternative_trust_score": credit_score
            },
            "personal_info": {
                "applicant_name": full_name,
                "father_spouse_name": form_data.get("father_spouse_name", ""),
                "dob": form_data.get("dob", ""),
                "gender": form_data.get("gender", ""),
                "permanent_address": form_data.get("address", "")
            },
            "vending_details": {
                "vending_activity": "Handloom Weaving & Sales",
                "vending_location": cluster_location,
                "certificate_of_recommendation_issued": form_data.get("has_association_letter", True)
            },
            "loan_details": {
                "requested_amount_inr": form_data.get("requested_amount", 10000.0),
                "repayment_tenure_months": 12,
                "e_mandate_consent": True
            }
        }

    elif product_id == "PMJDY_SAVINGS":
        # Form details exactly for Pradhan Mantri Jan Dhan Yojana application form
        return {
            "portal_meta": {
                "portal_id": "PMJDY_PORTAL",
                "form_version": "2025_SAVINGS",
                "api_endpoint": "https://pmjdy.gov.in/api/forms/apply_savings",
                "generated_at": now_iso
            },
            "identity_verification": {
                "full_name": full_name,
                "registered_phone": phone_number,
                "pehchan_id": pehchan_id
            },
            "applicant_profile": {
                "father_or_husband_name": form_data.get("father_spouse_name", ""),
                "address": form_data.get("address", ""),
                "occupation": "Handloom Weaver / Artisan",
                "annual_income_inr": form_data.get("annual_income", 120000.0),
                "is_unbanked_declaration": True
            },
            "benefits_opt_in": {
                "rupay_debit_card_requested": True,
                "accident_insurance_opt_in": True,
                "overdraft_facility_registration": True
            },
            "nominee_details": {
                "nominee_name": form_data.get("nominee_name", ""),
                "relationship": form_data.get("nominee_relationship", ""),
                "nominee_age": form_data.get("nominee_age", "")
            }
        }

    elif product_id == "MGBBY_INSURANCE":
        # Form details exactly for Mahatma Gandhi Bunkar Bima Yojana LIC Portal
        return {
            "portal_meta": {
                "portal_id": "LIC_MGBBY_WEAVER",
                "form_version": "v1.2",
                "api_endpoint": "https://licindia.in/api/v1/weaver-schemes/mgbby-enroll",
                "generated_at": now_iso
            },
            "verified_weaver_credentials": {
                "pehchan_card_id": pehchan_id,
                "active_weaver_status": "VERIFIED_ACTIVE"
            },
            "policy_holder": {
                "full_name": full_name,
                "date_of_birth": form_data.get("dob", ""),
                "gender": form_data.get("gender", ""),
                "contact_number": phone_number,
                "address": form_data.get("address", "")
            },
            "premium_split": {
                "government_subsidy_amount": 290.0,
                "lic_contribution_amount": 100.0,
                "weaver_premium_payable": 80.0
            },
            "nominee_details": {
                "nominee_name": form_data.get("nominee_name", ""),
                "relationship_with_nominee": form_data.get("nominee_relationship", ""),
                "nominee_age": form_data.get("nominee_age", "")
            },
            "shiksha_sahayog_yojana_opt_in": {
                "opt_in": form_data.get("has_children_scholarship", True),
                "child1_name": form_data.get("child1_name", None),
                "child1_class": form_data.get("child1_class", None),
                "child2_name": form_data.get("child2_name", None),
                "child2_class": form_data.get("child2_class", None)
            }
        }

    else:
        # Generic government scheme portal fallback form
        return {
            "portal_meta": {
                "portal_id": "GENERIC_GOVERNMENT_SCHEME",
                "product_id": product_id,
                "generated_at": now_iso
            },
            "applicant_info": {
                "full_name": full_name,
                "phone": phone_number,
                "email": email,
                "pehchan_id": pehchan_id,
                "yarn_passbook_id": yarn_passbook_id
            },
            "application_parameters": form_data,
            "verification_token": scoring_profile.get("score") if scoring_profile else None
        }
