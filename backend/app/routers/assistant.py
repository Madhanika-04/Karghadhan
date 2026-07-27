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
    user_id: Optional[UUID] = None
    language: str = Field(
        default="Hindi",
        description="Preferred response language (e.g. Hindi, Tamil, Telugu, Bengali)",
        examples=["Hindi", "Tamil", "Telugu", "Bengali", "Kannada"],
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
        "language": body.language,
        "user_message": body.message,
        "message_history": body.message_history,
    }

    try:
        result = await run_assistant(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assistant error: {exc}",
        ) from exc

    return ChatResponse(
        assistant_response=result["assistant_response"],
        message_history=result["message_history"],
        language=body.language,
    )
