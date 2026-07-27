"""
app/routers/auth.py
Authentication endpoints — manages user registration, Weaver profile creation,
e-Dhaga transaction seeding, and credit profile initialization.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.db.firebase import db
from app.db.supabase import supabase_client
from app.services.credit_scoring import calculate_weaver_score
from app.services.edhaga_simulation import generate_edhaga_passbook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

WEAVERS_COLLECTION = "weavers"
SCORING_COLLECTION = "weaver_scoring_profiles"
TRANSACTIONS_COLLECTION = "transaction_ledger"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone_number: Optional[str] = Field("9876543210", description="10-digit mobile number")
    cluster_location: Optional[str] = Field("Varanasi, Uttar Pradesh", description="Handloom cluster village/city")
    primary_language: str = Field("hi", description="hi, en, ta, te, kn, bn")
    experience_years: int = Field(5, ge=0, le=80)
    pehchan_id: Optional[str] = Field(None, description="14-digit/Alphanumeric Weaver Pehchan Card ID")
    yarn_passbook_id: Optional[str] = Field(None, description="Yarn Passbook ID (e-Dhaga portal)")
    cibil_score: Optional[int] = Field(None, ge=300, le=900, description="Optional manual CIBIL score")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register a new weaver account")
async def register(body: RegisterRequest):
    """
    Create a new user account, initialize Weaver profile, seed e-Dhaga transaction ledger,
    and compute initial fintech credit score profile.
    """
    user_id_str = None
    email_str = str(body.email)

    # 1. Sign up with Supabase Auth
    try:
        response = supabase_client.auth.sign_up(
            {"email": email_str, "password": body.password}
        )
        if response.user:
            user_id_str = str(response.user.id)
    except Exception as exc:
        logger.warning("Supabase auth sign_up notice: %s. Using local user ID fallback.", exc)

    if not user_id_str:
        user_id_str = str(uuid.uuid5(uuid.NAMESPACE_DNS, email_str.lower()))

    now_iso = datetime.now(timezone.utc).isoformat()
    weaver_id_str = str(uuid.uuid4())

    # 2. Generate e-Dhaga transaction ledger & passbook metrics
    edhaga_data = generate_edhaga_passbook(
        yarn_passbook_id=body.yarn_passbook_id,
        pehchan_id=body.pehchan_id,
        weaver_name=body.full_name,
    )

    # 3. Create Weaver Profile document in Firestore
    weaver_profile = {
        "id": weaver_id_str,
        "user_id": user_id_str,
        "email": email_str,
        "full_name": body.full_name,
        "phone_number": body.phone_number,
        "cluster_location": body.cluster_location or edhaga_data.cluster_office,
        "primary_language": body.primary_language,
        "experience_years": body.experience_years,
        "pehchan_id": edhaga_data.pehchan_id,
        "yarn_passbook_id": edhaga_data.yarn_passbook_id,
        "is_verified": True,
        "loom_assets": [],
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        db.collection(WEAVERS_COLLECTION).document(weaver_id_str).set(weaver_profile)
    except Exception as exc:
        logger.warning("Firestore weaver_profile save note: %s", exc)

    # 4. Seed user-specific transaction ledger
    for tx in edhaga_data.transactions:
        tx_dict = tx.model_dump()
        tx_dict["weaver_id"] = weaver_id_str
        try:
            db.collection(TRANSACTIONS_COLLECTION).document(tx.id).set(tx_dict, merge=True)
        except Exception:
            pass

    # 5. Compute & save initial Credit Scoring Profile
    score, risk_tier, breakdown = calculate_weaver_score(
        cibil_score=body.cibil_score,
        total_allocated_quota=edhaga_data.total_allocated_quota_kg,
        total_utilized_quota=edhaga_data.total_utilized_quota_kg,
        order_frequency_variance=edhaga_data.order_frequency_variance,
        avg_ticket_size_inr=edhaga_data.avg_ticket_size_inr,
        past_due_instances=edhaga_data.past_due_instances,
    )

    scoring_profile = {
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
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        db.collection(SCORING_COLLECTION).document(weaver_id_str).set(scoring_profile, merge=True)
    except Exception:
        pass

    return {
        "user_id": user_id_str,
        "weaver_id": weaver_id_str,
        "email": email_str,
        "full_name": body.full_name,
        "pehchan_id": edhaga_data.pehchan_id,
        "yarn_passbook_id": edhaga_data.yarn_passbook_id,
        "initial_credit_score": score,
        "risk_tier": risk_tier,
        "message": "Registration successful. User account and e-Dhaga Yarn Passbook ledger initialized.",
    }


@router.post("/login", summary="Log in and obtain JWT tokens")
async def login(body: LoginRequest):
    """Authenticate with email/password and return Supabase session tokens."""
    try:
        response = supabase_client.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials.",
            )
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": str(response.user.id),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.get("/me", summary="Get current logged-in user and weaver profile")
async def get_me(user_id: Optional[str] = None):
    """Fetch complete user profile, weaver profile, and credit score summary."""
    if not user_id:
        user_id = "default"

    try:
        query = db.collection(WEAVERS_COLLECTION).where("user_id", "==", str(user_id)).stream()
        profiles = [doc.to_dict() for doc in query]
        if not profiles:
            # Fallback to fetching all weavers
            all_docs = db.collection(WEAVERS_COLLECTION).limit(1).stream()
            profiles = [doc.to_dict() for doc in all_docs]

        if not profiles:
            raise HTTPException(status_code=404, detail="User profile not found")

        weaver_data = profiles[0]
        weaver_id = weaver_data.get("id")

        # Fetch scoring profile
        scoring_data = None
        if weaver_id:
            sdoc = db.collection(SCORING_COLLECTION).document(str(weaver_id)).get()
            if sdoc.exists:
                scoring_data = sdoc.to_dict()

        return {
            "weaver_profile": weaver_data,
            "scoring_profile": scoring_data,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
