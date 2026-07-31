"""
app/routers/agents.py
FastAPI router for calling KarghaDhan domain-specific specialized agents directly and managing personal user document vaults.
"""
from __future__ import annotations

from typing import Any, Optional, Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents import (
    creditworthiness_agent,
    loan_agent,
    scheme_agent,
    insurance_agent,
    savings_agent,
    notification_agent,
    literacy_agent,
    form_agent,
)
from app.services.document_vault import get_user_document_vault, save_user_document

router = APIRouter(prefix="/agents", tags=["Specialized Domain Agents"])


class AgentInvokeRequest(BaseModel):
    user_details: Dict[str, Any] = Field(default_factory=dict, description="Weaver financial and profile context")
    message: Optional[str] = Field(default="", description="User query or message")


class VaultUploadRequest(BaseModel):
    weaver_id: str = Field(..., description="Weaver Profile ID")
    doc_type: str = Field(..., description="Document type: pehchan_card | yarn_passbook | aadhaar_card | bank_passbook | loom_photo | passport_photo")
    doc_url: str = Field(..., description="Uploaded document URL or Storage path")
    doc_name: Optional[str] = Field(default=None, description="Human readable document title")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Extra document metadata")


@router.post("/creditworthiness", summary="Invoke Creditworthiness Assessment Agent")
async def evaluate_creditworthiness(body: AgentInvokeRequest):
    try:
        return creditworthiness_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/loan", summary="Invoke Loan Calculator & Eligibility Agent")
async def evaluate_loan(body: AgentInvokeRequest):
    try:
        return loan_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/scheme", summary="Invoke Government & MSME Scheme Matcher Agent")
async def evaluate_scheme(body: AgentInvokeRequest):
    try:
        return scheme_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/insurance", summary="Invoke Micro-Insurance Advisor Agent")
async def evaluate_insurance(body: AgentInvokeRequest):
    try:
        return insurance_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/savings", summary="Invoke Micro-Savings & Budgeting Agent")
async def evaluate_savings(body: AgentInvokeRequest):
    try:
        return savings_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/notification", summary="Invoke Deadline & Reminder Notification Agent")
async def evaluate_notification(body: AgentInvokeRequest):
    try:
        return notification_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/literacy", summary="Invoke Financial Literacy Explainer Agent")
async def evaluate_literacy(body: AgentInvokeRequest):
    try:
        return literacy_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/form-fill", summary="Invoke Automated Form-Filling & Document Attachment Agent")
async def fill_application_form(body: AgentInvokeRequest):
    try:
        return form_agent.run(user_details=body.user_details, message=body.message or "")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/vault/upload", summary="Save Document to Personal User Vault")
async def upload_document_to_vault(body: VaultUploadRequest):
    try:
        record = save_user_document(
            weaver_id=body.weaver_id,
            doc_type=body.doc_type,
            doc_url=body.doc_url,
            doc_name=body.doc_name,
            metadata=body.metadata,
        )
        return {"status": "SUCCESS", "message": f"Document '{body.doc_type}' saved to personal vault.", "document": record}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/vault/{weaver_id}", summary="Get Weaver Personal Document Vault")
async def get_weaver_vault(weaver_id: str):
    try:
        vault = get_user_document_vault(weaver_id=weaver_id)
        return {"weaver_id": weaver_id, "total_stored_documents": len(vault), "documents": vault}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
