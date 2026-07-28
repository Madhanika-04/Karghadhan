"""
app/agents/literacy_agent.py
Literacy Agent for KarghaDhan.
Provides deterministic, vernacular-friendly financial literacy explanations covering alternative credit scoring, reducing interest rates, micro-savings, micro-insurance, digital payments, and UPI fraud prevention.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are a vernacular financial literacy educator for Indian handloom weavers and artisans. 
Explain complex financial concepts (credit scores, interest rates, thrift funds, UPI safety, insurance) in simple, accessible terms."""

LITERACY_TOPICS = {
    "credit_score": {
        "title": "Understanding Your Weaver Credit Score",
        "explanation": (
            "Your credit score ranges from 300 to 900. In KarghaDhan, even without a formal bank loan, "
            "your credit score is built using your yarn quota utilization, saree sales transactions, "
            "and loom production capacity."
        ),
        "key_takeaways": [
            "Higher score = lower interest rates & higher loan limits.",
            "Record every saree sale in your ledger to boost your score.",
            "Avoid defaulting on Yarn Passbook quotas or micro-loan EMIs.",
        ],
        "faqs": [
            {"q": "What is a good score?", "a": "A score above 650 is considered Good, and above 750 is Excellent."},
            {"q": "How can I improve my score without bank statements?", "a": "Log informal sales regularly and maintain steady loom output."},
        ],
    },
    "interest_rates": {
        "title": "Flat vs. Reducing Interest Rates & Subventions",
        "explanation": (
            "Flat interest charges interest on the original loan amount throughout the tenure, "
            "whereas Reducing Balance interest calculates interest only on the remaining unpaid principal balance."
        ),
        "key_takeaways": [
            "Reducing balance is significantly cheaper than flat interest.",
            "Weaver Mudra subvention reduces interest down to 6% or 7% p.a.",
            "Always check the Effective Annualized Rate (APR) before signing loan documents.",
        ],
        "faqs": [
            {"q": "What is interest subvention?", "a": "It is a subsidy provided by the government where part of your interest rate is paid on your behalf."},
        ],
    },
    "thrift_fund": {
        "title": "Automated Micro-Savings (Thrift Fund)",
        "explanation": (
            "A Thrift Fund automatically sets aside a small slice (3% to 5%) from every saree sale "
            "into a dedicated emergency balance so you never have to make lump-sum bank deposits."
        ),
        "key_takeaways": [
            "Builds a safety buffer for raw material price surges or monsoon slowdowns.",
            "Keeps your money safe while remaining liquid for emergency withdrawal.",
        ],
        "faqs": [
            {"q": "Can I withdraw my thrift balance whenever needed?", "a": "Yes, emergency savings are available for immediate withdrawal via UPI."},
        ],
    },
    "fraud_prevention": {
        "title": "Digital Payments & UPI Security",
        "explanation": (
            "Digital payments via UPI or QR code allow instant receiving of saree sale funds directly into your bank account. "
            "Never share your 4-digit or 6-digit UPI PIN with anyone."
        ),
        "key_takeaways": [
            "UPI PIN is required ONLY to send or pay money, NEVER to receive money.",
            "Do not share OTPs, Aadhaar details, or banking passwords over phone calls.",
            "Verify buyer name on QR scan before authorizing payment.",
        ],
        "faqs": [
            {"q": "Do I need to enter my PIN to receive money?", "a": "No! Entering your PIN will DEDUCT money from your account."},
        ],
    },
}


class LiteracyAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="literacy_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic retrieval of financial literacy topics.
        """
        query = (message or user_details.get("topic") or "").lower()

        matched_topic = None
        if "score" in query or "cibil" in query or "credit" in query:
            matched_topic = LITERACY_TOPICS["credit_score"]
        elif "interest" in query or "rate" in query or "mudra" in query:
            matched_topic = LITERACY_TOPICS["interest_rates"]
        elif "savings" in query or "thrift" in query or "emergency" in query:
            matched_topic = LITERACY_TOPICS["thrift_fund"]
        elif "fraud" in query or "upi" in query or "pin" in query or "security" in query:
            matched_topic = LITERACY_TOPICS["fraud_prevention"]

        if matched_topic:
            return {
                "topic": matched_topic["title"],
                "explanation": matched_topic["explanation"],
                "key_takeaways": matched_topic["key_takeaways"],
                "faqs": matched_topic["faqs"],
            }

        # If no specific keyword matched, return all topics summary overview
        if not message and not user_details:
            return None

        all_topics_summary = [
            {"topic_key": k, "title": v["title"], "snippet": v["explanation"][:120] + "..."}
            for k, v in LITERACY_TOPICS.items()
        ]
        return {
            "overview": "KarghaDhan Financial Literacy Modules",
            "available_topics": all_topics_summary,
            "guidance": "Ask about credit scores, interest subvention, micro-savings thrift funds, or UPI fraud safety.",
        }


literacy_agent = LiteracyAgent()
