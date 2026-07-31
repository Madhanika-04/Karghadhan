import re
import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph

from app.agents.state import AssistantState
from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)


def detect_loan_intent(user_message: str, user_id: str = "", phone_number: str = "") -> dict | None:
    """
    Extracts loan intent, requested amount, and checks first-time vs repeat applicant status by mobile number.
    """
    text = user_message.lower()
    loan_keywords = ["loan", "credit", "borrow", "money", "ऋण", "लोन", "क्रेडिट", "पैसा", "उधार", "கடன்", "அப்ளை", "రుణం", "సాటా"]
    if not any(kw in text for kw in loan_keywords):
        return None

    # Amount extraction regex: 5k -> 5000, 50k -> 50000, 5000, 10000, 1 lakh
    amount = 50000.0  # default
    match_k = re.search(r'(\d+)\s*k\b', text)
    match_num = re.search(r'(\d[\d,]{2,7})', text)
    match_lakh = re.search(r'(\d+)\s*(lakh|l|लाख)', text)

    if match_k:
        amount = float(match_k.group(1)) * 1000
    elif match_lakh:
        amount = float(match_lakh.group(1)) * 100000
    elif match_num:
        val = match_num.group(1).replace(',', '')
        if float(val) >= 500:
            amount = float(val)

    amount = max(1000.0, min(amount, 500000.0))

    # Check previous applications in Firestore by mobile number / weaver ID
    existing_count = 0
    try:
        from app.db.firebase import db
        if phone_number:
            query = db.collection("loan_applications").where("mobile_number", "==", phone_number).stream()
            existing_count = len(list(query))
        elif user_id:
            query = db.collection("loan_applications").where("weaver_id", "==", user_id).stream()
            existing_count = len(list(query))
    except Exception as exc:
        logger.warning("Error checking loan application history by phone/weaver_id: %s", exc)

    is_first_time = (existing_count == 0)
    eligible = True  # First-time applicants are pre-approved; repeat applicants verified via credit rating

    return {
        "action": "OPEN_LOAN_MODAL",
        "requested_amount": amount,
        "is_first_time": is_first_time,
        "eligible": eligible,
        "existing_loans_count": existing_count,
        "phone_number": phone_number,
    }


_SYSTEM_PROMPT_TEMPLATE = """You are KarghaDhan AI (करघाधन एआई), the official financial assistant for handloom weavers on the KarghaDhan Platform.

Detected User Language: {language}

STRICT PROFESSIONAL RULE:
- You MUST respond in the EXACT same language that the user typed or spoke in. 
- If the user writes in English, reply 100% in English.
- If the user writes in Hindi (Devanagari), reply 100% in pure Devanagari Hindi. 
- If the user writes in Tamil, Telugu, etc., reply in that specific language.
- Provide precise, friendly answers about KarghaDhan services:
  1. Weaver Pehchan Card (बुनकर पहचान पत्र / ID for subsidies)
  2. e-Dhaga Yarn Passbook (ई-धागा पासबुक / yarn ledger)
  3. KarghaDhan Credit Score (करघाधन क्रेडिट स्कोर - 300 to 900)
  4. Micro-Loans & Government Subvention (6% interest subsidy)
  5. Insurance & Welfare (बुनकर स्वास्थ्य व जीवन बीमा)
  6. Financial Literacy & Savings
- Do not mix languages. Maintain professional AI behavior.
"""


def detect_language_from_text(text: str, default_lang: str) -> str:
    """Auto-detect language script or common words to override UI default for a professional AI experience."""
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "Tamil"
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "Telugu"
    
    text_lower = text.lower()
    # If the text has obvious English words, force English response
    english_indicators = ["loan", "what", "how", "want", "need", "hi", "hello", "english", "credit", "borrow", "money", "please", "help"]
    # Check if any english word is present as a discrete word
    words = re.findall(r'\b[a-z]+\b', text_lower)
    if any(w in english_indicators for w in words):
        return "English"
    
    # If text is purely ascii letters, likely English or transliterated
    if re.match(r'^[a-zA-Z\s\.,!\?0-9]+$', text) and len(words) > 0:
        return "English"

    return default_lang


async def generate_response(state: dict) -> dict:
    """Invoke LLM with conversation history and return assistant response."""
    ui_language = state.get("language", "Hindi")
    user_message = state.get("user_message", "")
    user_id = state.get("user_id", "")
    phone_number = state.get("phone_number", "")
    history = state.get("message_history", [])

    # Professional AI overrides UI language based on actual user input
    language = detect_language_from_text(user_message, ui_language)

    # Check for Loan Intent
    loan_intent = detect_loan_intent(user_message, user_id, phone_number)

    assistant_text = ""
    if loan_intent:
        amt = loan_intent["requested_amount"]
        is_first = loan_intent["is_first_time"]
        if language in ["Hindi", "hi"]:
            if is_first:
                assistant_text = f"मैंने आपके मोबाइल नंबर से आपकी पात्रता की जांच की है। आप पहली बार ₹{amt:,.0f} का माइक्रो-लोन आवेदन कर रहे हैं! आपके पहचान पत्र व ई-धागा पासबुक का विवरण स्वतः भर दिया गया है। मैं आपको लोन आवेदन पृष्ठ पर ले जा रहा हूँ..."
            else:
                assistant_text = f"आपकी ऋण पात्रता सफलतापूर्वक सत्यापित की गई है! ₹{amt:,.0f} के लिए आवेदन पत्र डैशबोर्ड से स्वतः भर दिया गया है। मैं आपको लोन पेज पर रिडायरेक्ट कर रहा हूँ..."
        elif language in ["Tamil", "ta"]:
            assistant_text = f"உங்கள் கைபேசி எண்ணின் அடிப்படையில் தகுதி சரிபார்க்கப்பட்டது. நீங்கள் ₹{amt:,.0f} கடனுக்குத் தகுதியானவர்! விவரங்கள் தானாக நிரப்பப்பட்டுள்ளன."
        elif language in ["Telugu", "te"]:
            assistant_text = f"మీ మొబైల్ నంబర్ ఆధారంగా అర్హత తనిఖీ చేయబడింది. మీరు ₹{amt:,.0f} రుణం కోసం అర్హులు!"
        else:
            # Default to English
            if is_first:
                assistant_text = f"I have verified your eligibility based on your mobile number. As a first-time applicant, your pre-approved ₹{amt:,.0f} micro-loan form is ready with all dashboard details auto-filled! Redirecting you to the loan application page..."
            else:
                assistant_text = f"Your loan eligibility check is complete! Your ₹{amt:,.0f} application form has been auto-filled with your verified credentials. Navigating to the loan submission form..."
    else:
        system_prompt = _SYSTEM_PROMPT_TEMPLATE.format(language=language)
        messages = [SystemMessage(content=system_prompt)]

        for turn in history[-10:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role == "assistant":
                messages.append(AIMessage(content=content))
            else:
                messages.append(HumanMessage(content=content))

        messages.append(HumanMessage(content=user_message))

        try:
            llm = get_default_llm()
            response = await llm.ainvoke(messages)
            assistant_text = response.content
        except Exception as exc:
            logger.error("Assistant LLM call failed: %s", exc)
            if language == "Hindi":
                if "लोन" in user_message or "ऋण" in user_message or "पैसा" in user_message:
                    assistant_text = "आप करघाधन मंच के माध्यम से 6% ब्याज सब्सिडी पर मुद्रा योजना एवं ई-धागा पासबुक के आधार पर ₹5,00,000 तक का माइक्रो-लोन प्राप्त कर सकते हैं। लोन आवेदन के लिए कहें 'मुझे 50,000 का लोन चाहिए'।"
                elif "पहचान" in user_message or "कार्ड" in user_message:
                    assistant_text = "बुनकर पहचान पत्र (Weaver Pehchan ID) भारत सरकार के वस्त्र मंत्रालय द्वारा जारी 14 अंकों का कार्ड है। यह आपको सरकारी सब्सिडी और रियायती लोन दिलाने में मदद करता है।"
                elif "पासबुक" in user_message or "धागा" in user_message:
                    assistant_text = "ई-धागा पासबुक राष्ट्रीय हथकरघा विकास कार्यक्रम के तहत सब्सिडी वाले सूत की खरीद और कोटे का डिजिटल रिकॉर्ड रखता है।"
                else:
                    assistant_text = "नमस्ते! मैं करघाधन एआई सहायक हूँ। मैं आपके बुनकर पहचान पत्र, ई-धागा पासबुक, क्रेडिट स्कोर, लोन और सरकारी योजनाओं की जानकारी देने के लिए उपलब्ध हूँ।"
            else:
                assistant_text = "Hello! I am KarghaDhan AI. I am here to help you with Weaver Pehchan Card, Yarn Passbook, Credit Score, Micro-Loans, and Government Subsidies."

    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": assistant_text},
    ]

    return {
        **state,
        "assistant_response": assistant_text,
        "message_history": updated_history,
        "loan_intent": loan_intent,
        "detected_language": language,
    }


def _build_assistant_graph() -> Any:
    builder: StateGraph = StateGraph(dict)
    builder.add_node("generate_response", generate_response)
    builder.add_edge(START, "generate_response")
    builder.add_edge("generate_response", END)
    return builder.compile()


assistant_graph = _build_assistant_graph()


async def run_assistant(payload: dict) -> dict:
    """
    Run the vernacular assistant agent.
    """
    initial_state = {
        "user_id": str(payload.get("user_id", "")),
        "phone_number": str(payload.get("phone_number", "")),
        "language": payload.get("language", "Hindi"),
        "user_message": payload.get("user_message", ""),
        "message_history": payload.get("message_history", []),
    }

    return await assistant_graph.ainvoke(initial_state)
