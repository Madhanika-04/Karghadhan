"""
app/routers/agents.py
FastAPI router for calling KarghaDhan domain-specific specialized agents directly.
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
)

router = APIRouter(prefix="/agents", tags=["Specialized Domain Agents"])


class AgentInvokeRequest(BaseModel):
    user_details: Dict[str, Any] = Field(default_factory=dict, description="Weaver financial and profile context")
    message: Optional[str] = Field(default="", description="User query or message")


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
