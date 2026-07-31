"""
app/services/llm.py
Factory functions for LangChain-compatible LLM instances.
Defaults to Google Gemini; falls back to OpenAI when OPENAI_API_KEY is set.
"""
from __future__ import annotations

from functools import lru_cache
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings


@lru_cache(maxsize=4)
def get_gemini_llm(
    model: str = "gemini-2.5-flash",
    temperature: float = 0.2,
) -> BaseChatModel:
    """Return a cached Gemini chat model instance."""
    settings = get_settings()
    return ChatGoogleGenerativeAI(  # type: ignore[call-arg]
        model=model,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
    )


def get_openai_llm(
    model: str = "gpt-4o-mini",
    temperature: float = 0.2,
) -> BaseChatModel:
    """Return an OpenAI chat model instance (optional fallback)."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured")
    from langchain_openai import ChatOpenAI  # lazy import
    return ChatOpenAI(
        model=model,
        api_key=settings.OPENAI_API_KEY,  # type: ignore[arg-type]
        temperature=temperature,
    )


def get_default_llm() -> BaseChatModel:
    """Return the primary LLM (Gemini). Falls back to OpenAI if Gemini key missing."""
    settings = get_settings()
    if settings.GEMINI_API_KEY:
        return get_gemini_llm()
    return get_openai_llm()
