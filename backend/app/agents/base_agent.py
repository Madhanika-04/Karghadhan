"""
app/agents/base_agent.py
Base class for KarghaDhan LLM-driven and deterministic financial agents.

Design Pattern:
- Subclasses implement `_build_response(user_details, message)` for deterministic rule-based guidance.
- If `_build_response` produces a valid structured output dictionary, it is returned directly.
- If structured context is incomplete or the query is open-ended, the agent falls back to generating a response using LLM (Gemini / OpenAI).
"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional, Dict

from langchain_core.messages import HumanMessage, SystemMessage
from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for domain-specific financial protection and advice agents."""

    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic recommendation logic implemented by subclasses.
        Returns a dict if sufficient structured data is present, or None to fallback to LLM.
        """
        return None

    def run(self, user_details: dict[str, Any], message: str = "") -> dict[str, Any]:
        """
        Execute the agent pipeline.
        Attempts deterministic logic first; falls back to LLM conversational generation if needed.
        """
        user_details = user_details or {}
        
        # 1. Attempt deterministic rule-based response
        try:
            structured_res = self._build_response(user_details, message)
            if structured_res is not None:
                structured_res["agent_name"] = self.name
                structured_res["execution_mode"] = "DETERMINISTIC"
                return structured_res
        except Exception as exc:
            logger.warning("Deterministic logic failed in %s: %s", self.name, exc)

        # 2. LLM Fallback Execution
        logger.info("Executing LLM fallback for agent: %s", self.name)
        try:
            llm = get_default_llm()
            context_prompt = (
                f"User Profile & Financial Context:\n{json.dumps(user_details, indent=2, default=str)}\n\n"
                f"User Message / Request:\n{message or 'Provide financial guidance and recommendations.'}"
            )
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=context_prompt),
            ]
            response = llm.invoke(messages)
            raw_content = str(response.content).strip()

            # Attempt parsing JSON response from LLM if structured
            parsed_content: Any = raw_content
            if raw_content.startswith("{") or raw_content.startswith("```json"):
                clean_json = raw_content.strip("```json").strip("```").strip()
                try:
                    parsed_content = json.loads(clean_json)
                except Exception:
                    pass

            return {
                "agent_name": self.name,
                "execution_mode": "LLM_FALLBACK",
                "summary": parsed_content if isinstance(parsed_content, dict) else {"message": raw_content},
                "raw_response": raw_content,
            }
        except Exception as exc:
            logger.error("LLM fallback failed in %s: %s", self.name, exc)
            return {
                "agent_name": self.name,
                "execution_mode": "ERROR_FALLBACK",
                "summary": {"error": f"Unable to process request: {str(exc)}"},
            }
