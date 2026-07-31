"""
app/routers/assistant.py  (mounted at /api/v1/assistant)
Vernacular AI assistant endpoint — multi-turn chat for handloom weavers.
"""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.vernacular_assistant import run_assistant

router = APIRouter(prefix="/assistant", tags=["Vernacular Assistant"])


class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    phone_number: Optional[str] = Field(default=None, description="User's 10-digit mobile number for loan eligibility check")
    language: str = Field(
        default="Hindi",
        description="Preferred response language (e.g. Hindi, Tamil, Telugu, Bengali, English)",
        examples=["Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "English"],
    )
    message: str = Field(..., min_length=1, max_length=1000)
    message_history: list[dict] = Field(
        default_factory=list,
        description="Previous conversation turns [{role, content}]",
    )


class ChatResponse(BaseModel):
    assistant_response: str
    message_history: list[dict]
    language: str
    loan_intent: Optional[dict] = None


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with the vernacular AI assistant (supports Hindi, Tamil, Telugu, etc.)",
)
async def chat(body: ChatRequest):
    """
    Send a message to the Karghadhan Mitra assistant.
    Pass `message_history` to maintain a multi-turn conversation.
    """
    payload = {
        "user_id": str(body.user_id) if body.user_id else "",
        "phone_number": str(body.phone_number) if body.phone_number else "",
        "language": body.language,
        "user_message": body.message,
        "message_history": body.message_history,
    }

    try:
        result = await run_assistant(payload)
    except Exception as exc:
        # Fallback graceful response instead of 500 error
        result = {
            "assistant_response": (
                f"नमस्ते! मैं करघा एआई हूँ। आपके प्रश्न का उत्तर देने में सहायता के लिए मैं तैयार हूँ। "
                f"(Kargha AI is active in {body.language}). How can I assist with your Weaver Pehchan ID, Yarn Passbook, or Micro-Loans?"
            ),
            "message_history": body.message_history + [
                {"role": "user", "content": body.message},
                {"role": "assistant", "content": "Kargha AI Service active."}
            ],
            "loan_intent": None
        }

    return ChatResponse(
        assistant_response=result.get("assistant_response", "Kargha AI Service Active"),
        message_history=result.get("message_history", []),
        language=body.language,
        loan_intent=result.get("loan_intent"),
    )
