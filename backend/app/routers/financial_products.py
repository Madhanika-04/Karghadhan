"""
app/routers/financial_products.py
Router endpoints for real-world micro-credit, savings, and insurance suggestions and application forms.
Stores completed form configurations in Firestore.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.firebase import db
from app.schemas.financial_product import (
    ProductRecommendationsResponse,
    PortalApplicationRequest,
    PortalApplicationResponse,
)
from app.services.financial_products import (
    get_recommendations_for_weaver,
    generate_portal_form_json,
    LOAN_PRODUCTS,
    SAVINGS_PRODUCTS,
    INSURANCE_PRODUCTS,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/financial-products", tags=["Financial Suggestions & Portals"])

WEAVERS_COLLECTION = "weavers"
SCORING_COLLECTION = "weaver_scoring_profiles"
APPLICATIONS_COLLECTION = "portal_applications"


@router.get(
    "/recommendations/{weaver_id}",
    response_model=ProductRecommendationsResponse,
    summary="Get personalized financial suggestions based on credit score",
)
async def get_recommendations(weaver_id: UUID):
    """
    Fetches the weaver's credit score and evaluates their eligibility
    for actual government/banking micro-credit, savings, and insurance portals.
    """
    weaver_id_str = str(weaver_id)

    # 1. Fetch weaver profile from Firestore
    weaver_doc = db.collection(WEAVERS_COLLECTION).document(weaver_id_str).get()
    if not weaver_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver profile with ID {weaver_id} not found.",
        )

    # 2. Fetch scoring profile
    score = 350
    risk_tier = "Risky"
    score_doc = db.collection(SCORING_COLLECTION).document(weaver_id_str).get()
    if score_doc.exists:
        sdata = score_doc.to_dict()
        score = sdata.get("score", 350)
        risk_tier = sdata.get("risk_tier", "Risky")
    else:
        logger.warning("No scoring profile found for weaver %s. Falling back to default baseline score 350.", weaver_id_str)

    # 3. Generate recommended products
    recs = get_recommendations_for_weaver(weaver_id_str, score, risk_tier)
    
    return ProductRecommendationsResponse(
        weaver_id=weaver_id,
        credit_score=score,
        risk_tier=risk_tier,
        recommended_loans=recs["recommended_loans"],
        recommended_savings=recs["recommended_savings"],
        recommended_insurance=recs["recommended_insurance"],
    )


@router.post(
    "/apply-portal",
    response_model=PortalApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit and generate a portal application JSON form for a financial product",
)
async def apply_portal(body: PortalApplicationRequest):
    """
    Combines verified weaver profile information (Aadhaar name, phone, Pehchan ID, etc.)
    with application form inputs. Generates a completed JSON schema that perfectly matches
    the official target portal requirements and saves it to Firestore.
    """
    weaver_id_str = str(body.weaver_id)

    # 1. Retrieve weaver profile
    weaver_doc = db.collection(WEAVERS_COLLECTION).document(weaver_id_str).get()
    if not weaver_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver profile with ID {body.weaver_id} not found.",
        )
    weaver_profile = weaver_doc.to_dict()

    # 2. Retrieve scoring profile
    score_doc = db.collection(SCORING_COLLECTION).document(weaver_id_str).get()
    scoring_profile = score_doc.to_dict() if score_doc.exists else None

    # 3. Lookup product metadata
    product = None
    all_products = LOAN_PRODUCTS + SAVINGS_PRODUCTS + INSURANCE_PRODUCTS
    for p in all_products:
        if p.id == body.product_id:
            product = p
            break

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial product with ID '{body.product_id}' not found.",
        )

    # 4. Generate filled portal form JSON
    filled_form = generate_portal_form_json(
        weaver_profile=weaver_profile,
        scoring_profile=scoring_profile,
        product_id=body.product_id,
        form_data=body.form_data
    )

    # 5. Persist to Firestore
    application_id_str = str(uuid.uuid4())
    applied_at_iso = datetime.now(timezone.utc).isoformat()

    record = {
        "id": application_id_str,
        "weaver_id": weaver_id_str,
        "product_id": body.product_id,
        "product_name": product.name,
        "portal_name": product.portal_name,
        "portal_url": product.portal_url,
        "filled_form_json": filled_form,
        "applied_at": applied_at_iso
    }

    try:
        db.collection(APPLICATIONS_COLLECTION).document(application_id_str).set(record)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firestore save failed: {exc}",
        ) from exc

    return PortalApplicationResponse(
        application_id=UUID(application_id_str),
        weaver_id=body.weaver_id,
        product_id=body.product_id,
        product_name=product.name,
        portal_name=product.portal_name,
        portal_url=product.portal_url,
        filled_form_json=filled_form,
        applied_at=datetime.fromisoformat(applied_at_iso),
    )


@router.get(
    "/portal-applications/{weaver_id}",
    response_model=list[PortalApplicationResponse],
    summary="Get all completed portal forms generated for a weaver",
)
async def list_portal_applications(weaver_id: UUID):
    """
    Fetches all completed application form JSONs stored for a specific weaver, newest first.
    """
    weaver_id_str = str(weaver_id)
    try:
        query = db.collection(APPLICATIONS_COLLECTION).where("weaver_id", "==", weaver_id_str).stream()
        results = []
        for doc in query:
            data = doc.to_dict()
            results.append(
                PortalApplicationResponse(
                    application_id=UUID(data["id"]),
                    weaver_id=UUID(data["weaver_id"]),
                    product_id=data["product_id"],
                    product_name=data["product_name"],
                    portal_name=data["portal_name"],
                    portal_url=data["portal_url"],
                    filled_form_json=data["filled_form_json"],
                    applied_at=datetime.fromisoformat(data["applied_at"]),
                )
            )
        # Sort by applied_at descending
        results.sort(key=lambda x: x.applied_at, reverse=True)
        return results
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database fetch failed: {exc}",
        ) from exc
