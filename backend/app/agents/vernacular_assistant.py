"""
app/agents/vernacular_assistant.py
LangGraph-based conversational agent that supports multiple Indian languages.
Maintains a short message history in state for multi-turn conversations.
"""
from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph

from app.agents.state import AssistantState
from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt template
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT_TEMPLATE = """You are Karghadhan Mitra, a friendly AI assistant 
helping Indian handloom weavers understand financial products, government schemes, 
and micro-credit in their native language.

Current user language: {language}

Rules:
- ALWAYS respond in {language} using simple, non-technical vocabulary.
- If the user asks in a different language, gently switch to that language.
- Keep answers concise (3–5 sentences) unless asked for detail.
- For loan/scheme questions, mention eligibility criteria and how to apply.
- Never provide specific interest-rate guarantees — recommend consulting a partner bank.
- Be warm, encouraging, and respectful of the weaver's craft and livelihood.
"""

# ---------------------------------------------------------------------------
# Node: Generate Response
# ---------------------------------------------------------------------------

def generate_response(state: AssistantState) -> AssistantState:
    """Invoke LLM with conversation history and return assistant response."""
    language = state.get("language", "Hindi")
    user_message = state.get("user_message", "")
    history = state.get("message_history", [])

    system_prompt = _SYSTEM_PROMPT_TEMPLATE.format(language=language)

    messages = [SystemMessage(content=system_prompt)]

    # Replay conversation history
    for turn in history[-10:]:  # keep last 10 turns to stay within context
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "assistant":
            messages.append(AIMessage(content=content))
        else:
            messages.append(HumanMessage(content=content))

    # Append the new user message
    messages.append(HumanMessage(content=user_message))

    try:
        llm = get_default_llm()
        response = llm.invoke(messages)
        assistant_text = response.content
    except Exception as exc:
        logger.error("Assistant LLM call failed: %s", exc)
        assistant_text = "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।"

    # Update history
    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": assistant_text},
    ]

    return {
        **state,
        "assistant_response": assistant_text,
        "message_history": updated_history,
    }


# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------

def _build_assistant_graph() -> Any:
    builder: StateGraph = StateGraph(AssistantState)
    builder.add_node("generate_response", generate_response)
    builder.add_edge(START, "generate_response")
    builder.add_edge("generate_response", END)
    return builder.compile()


assistant_graph = _build_assistant_graph()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_assistant(payload: dict) -> dict:
    """
    Run the vernacular assistant agent.

    Args:
        payload: dict with keys: user_id, language, user_message, message_history.

    Returns:
        Updated state dict with assistant_response and message_history.
    """
    initial_state: AssistantState = {
        "user_id": str(payload.get("user_id", "")),
        "language": payload.get("language", "Hindi"),
        "user_message": payload.get("user_message", ""),
        "message_history": payload.get("message_history", []),
    }

    return await assistant_graph.ainvoke(initial_state)
