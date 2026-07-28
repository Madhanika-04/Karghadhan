"""
app/routers/credit_scoring.py
Router endpoints for calculation and storage of Weaver Credit Scores using Firebase Firestore.
Collection: `weaver_scoring_profiles`
"""
from __future__ import annotations

import base64
import json
import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.db.firebase import db
from app.schemas.credit_scoring import EDhagaFetchRequest, ScoringProfileCreate, ScoringProfileResponse
from app.services.credit_scoring import calculate_weaver_score
from app.services.edhaga_simulation import generate_edhaga_passbook
from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/score", tags=["Fintech Credit Scoring"])

SCORING_COLLECTION = "weaver_scoring_profiles"
WEAVERS_COLLECTION = "weavers"
TRANSACTIONS_COLLECTION = "transaction_ledger"


@router.post(
    "/calculate",
    response_model=ScoringProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate alternative fintech credit score for a weaver and upsert data",
)
async def calculate_score(body: ScoringProfileCreate):
    """
    Evaluates alternative fintech credit score using Yarn Passbook quota log
    and CIBIL score. Upserts the scoring record in Firestore collection 'weaver_scoring_profiles'.
    """
    weaver_id_str = str(body.weaver_id)

    # 1. Check if Weaver Profile exists in Firestore
    weaver_doc = db.collection(WEAVERS_COLLECTION).document(weaver_id_str).get()
    if not weaver_doc.exists:
        db.collection(WEAVERS_COLLECTION).document(weaver_id_str).set({
            "id": weaver_id_str,
            "full_name": "Weaver " + weaver_id_str[:8],
            "pehchan_id": body.pehchan_id,
            "yarn_passbook_id": body.yarn_passbook_id,
            "is_verified": False,
        }, merge=True)
    else:
        # Merge Pehchan ID & Yarn Passbook ID into weaver profile
        updates = {}
        if body.pehchan_id:
            updates["pehchan_id"] = body.pehchan_id
        if body.yarn_passbook_id:
            updates["yarn_passbook_id"] = body.yarn_passbook_id
        if updates:
            db.collection(WEAVERS_COLLECTION).document(weaver_id_str).update(updates)

    # 2. Run the math scoring pipeline
    score, risk_tier, breakdown = calculate_weaver_score(
        cibil_score=body.cibil_score,
        total_allocated_quota=body.total_allocated_quota,
        total_utilized_quota=body.total_utilized_quota,
        order_frequency_variance=body.order_frequency_variance,
        avg_ticket_size_inr=body.avg_ticket_size_inr,
        past_due_instances=body.past_due_instances
    )

    # 3. Create database payload
    db_record = {
        "weaver_id": weaver_id_str,
        "pehchan_id": body.pehchan_id,
        "yarn_passbook_id": body.yarn_passbook_id,
        "cibil_score": body.cibil_score,
        "total_allocated_quota": body.total_allocated_quota,
        "total_utilized_quota": body.total_utilized_quota,
        "order_frequency_variance": body.order_frequency_variance,
        "avg_ticket_size_inr": body.avg_ticket_size_inr,
        "past_due_instances": body.past_due_instances,
        "score": score,
        "risk_tier": risk_tier,
        "score_breakdown": breakdown,
    }

    # 4. Upsert into Firestore
    try:
        db.collection(SCORING_COLLECTION).document(weaver_id_str).set(db_record, merge=True)
        return db_record
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firestore persistence error: {exc}"
        ) from exc


@router.post(
    "/edhaga-fetch",
    response_model=ScoringProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate e-Dhaga portal fetch by Yarn Passbook ID or Pehchan ID",
    description="Fetches user-specific transaction history from simulated NHDC e-Dhaga portal, seeds transaction ledger, and calculates credit score.",
)
async def fetch_edhaga_and_score(body: EDhagaFetchRequest):
    """
    Simulates e-Dhaga portal integration for a given Yarn Passbook ID or Pehchan Card ID.
    Generates deterministic, person-specific transaction ledger and calculates credit score.
    """
    weaver_id_str = str(body.weaver_id)

    # Lookup weaver details
    weaver_doc = db.collection(WEAVERS_COLLECTION).document(weaver_id_str).get()
    weaver_name = None
    if weaver_doc.exists:
        wdata = weaver_doc.to_dict()
        weaver_name = wdata.get("full_name")

    # Generate e-Dhaga simulation payload
    edhaga_data = generate_edhaga_passbook(
        yarn_passbook_id=body.yarn_passbook_id,
        pehchan_id=body.pehchan_id,
        weaver_name=weaver_name,
    )

    # Seed transaction ledger in Firestore
    for tx in edhaga_data.transactions:
        tx_dict = tx.model_dump()
        tx_dict["weaver_id"] = weaver_id_str
        db.collection(TRANSACTIONS_COLLECTION).document(tx.id).set(tx_dict, merge=True)

    # Calculate score using e-Dhaga metrics + CIBIL score
    score, risk_tier, breakdown = calculate_weaver_score(
        cibil_score=body.cibil_score,
        total_allocated_quota=edhaga_data.total_allocated_quota_kg,
        total_utilized_quota=edhaga_data.total_utilized_quota_kg,
        order_frequency_variance=edhaga_data.order_frequency_variance,
        avg_ticket_size_inr=edhaga_data.avg_ticket_size_inr,
        past_due_instances=edhaga_data.past_due_instances,
    )

    record = {
        "weaver_id": weaver_id_str,
        "pehchan_id": edhaga_data.pehchan_id,
        "yarn_passbook_id": edhaga_data.yarn_passbook_id,
        "cibil_score": body.cibil_score,
        "total_allocated_quota": edhaga_data.total_allocated_quota_kg,
        "total_utilized_quota": edhaga_data.total_utilized_quota_kg,
        "order_frequency_variance": edhaga_data.order_frequency_variance,
        "avg_ticket_size_inr": edhaga_data.avg_ticket_size_inr,
        "past_due_instances": edhaga_data.past_due_instances,
        "score": score,
        "risk_tier": risk_tier,
        "score_breakdown": breakdown,
    }

    # Update weaver profile with fetched Pehchan & Passbook IDs
    db.collection(WEAVERS_COLLECTION).document(weaver_id_str).set({
        "pehchan_id": edhaga_data.pehchan_id,
        "yarn_passbook_id": edhaga_data.yarn_passbook_id,
        "cluster_location": edhaga_data.cluster_office,
    }, merge=True)

    # Save scoring profile
    db.collection(SCORING_COLLECTION).document(weaver_id_str).set(record, merge=True)

    return record


@router.post(
    "/passbook-upload",
    response_model=ScoringProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload physical Yarn Passbook photo/PDF for OCR parsing and scoring",
)
async def upload_passbook_and_score(
    weaver_id: UUID = Form(...),
    cibil_score: Optional[int] = Form(None),
    passbook_file: UploadFile = File(..., description="Yarn Passbook image or PDF file"),
):
    """
    Parse uploaded Yarn Passbook physical document using Gemini Vision,
    extract quota allocations and transaction data, and evaluate credit score.
    """
    weaver_id_str = str(weaver_id)
    file_bytes = await passbook_file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded passbook file is empty.",
        )

    # Perform Vision OCR with Gemini
    content_type = passbook_file.content_type or "image/jpeg"
    b64_img = base64.b64encode(file_bytes).decode("utf-8")

    llm = get_default_llm()
    prompt = (
        "Analyze this Yarn Passbook / Handloom Weaver Card document image.\n"
        "Extract the following structured fields in JSON:\n"
        "{\n"
        '  "pehchan_id": "string or null",\n'
        '  "yarn_passbook_id": "string or null",\n'
        '  "allocated_quota_kg": number,\n'
        '  "utilized_quota_kg": number,\n'
        '  "order_variance_days": number,\n'
        '  "avg_ticket_size_inr": number,\n'
        '  "past_due_instances": number\n'
        "}\n"
    )

    from langchain_core.messages import HumanMessage
    msg = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:{content_type};base64,{b64_img}"},
            },
        ]
    )

    try:
        res = await llm.ainvoke([msg])
        rtext = res.content
        if isinstance(rtext, list):
            rtext = " ".join([str(i) for i in rtext])

        clean_json = rtext.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()

        ocr_data = json.loads(clean_json)
    except Exception as exc:
        logger.warning("OCR passbook parsing fallback to simulation: %s", exc)
        edhaga_data = generate_edhaga_passbook(weaver_name=f"Weaver {weaver_id_str[:8]}")
        ocr_data = {
            "pehchan_id": edhaga_data.pehchan_id,
            "yarn_passbook_id": edhaga_data.yarn_passbook_id,
            "allocated_quota_kg": edhaga_data.total_allocated_quota_kg,
            "utilized_quota_kg": edhaga_data.total_utilized_quota_kg,
            "order_variance_days": edhaga_data.order_frequency_variance,
            "avg_ticket_size_inr": edhaga_data.avg_ticket_size_inr,
            "past_due_instances": edhaga_data.past_due_instances,
        }

    allocated = float(ocr_data.get("allocated_quota_kg", 500.0))
    utilized = float(ocr_data.get("utilized_quota_kg", 420.0))
    var_days = float(ocr_data.get("order_variance_days", 10.0))
    avg_ticket = float(ocr_data.get("avg_ticket_size_inr", 18000.0))
    past_dues = int(ocr_data.get("past_due_instances", 0))

    pehchan = ocr_data.get("pehchan_id") or f"IND-HL-{weaver_id_str[:8].upper()}"
    passbook = ocr_data.get("yarn_passbook_id") or f"YP-2024-UP-{weaver_id_str[:5].upper()}"

    score, risk_tier, breakdown = calculate_weaver_score(
        cibil_score=cibil_score,
        total_allocated_quota=allocated,
        total_utilized_quota=utilized,
        order_frequency_variance=var_days,
        avg_ticket_size_inr=avg_ticket,
        past_due_instances=past_dues,
    )

    record = {
        "weaver_id": weaver_id_str,
        "pehchan_id": pehchan,
        "yarn_passbook_id": passbook,
        "cibil_score": cibil_score,
        "total_allocated_quota": allocated,
        "total_utilized_quota": utilized,
        "order_frequency_variance": var_days,
        "avg_ticket_size_inr": avg_ticket,
        "past_due_instances": past_dues,
        "score": score,
        "risk_tier": risk_tier,
        "score_breakdown": breakdown,
    }

    db.collection(SCORING_COLLECTION).document(weaver_id_str).set(record, merge=True)
    return record


@router.get(
    "/{weaver_id}",
    response_model=ScoringProfileResponse,
    summary="Get fintech scoring profile and score for a weaver",
)
async def get_scoring_profile(weaver_id: UUID):
    """Retrieves the credit scoring profile for the given weaver from Firestore."""
    weaver_id_str = str(weaver_id)
    try:
        doc = db.collection(SCORING_COLLECTION).document(weaver_id_str).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scoring profile for weaver {weaver_id} not found."
            )
        return doc.to_dict()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database fetch error: {exc}"
        ) from exc
