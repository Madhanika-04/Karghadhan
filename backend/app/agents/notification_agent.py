"""
app/agents/notification_agent.py
Notification Agent for KarghaDhan.
Formats reminder text, tracks payment deadlines (EMIs, yarn passbook renewals, insurance slice deductions), and provides actionable alerts.
"""
from __future__ import annotations

from typing import Any, Optional
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are an automated notification assistant for KarghaDhan. 
Generate concise, urgent, and helpful payment reminders, deadline alerts, and vernacular notifications for handloom weavers."""


class NotificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="notification_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic formatting of reminders and deadlines.
        """
        deadlines = user_details.get("deadlines", [])
        if not deadlines and not user_details.get("upcoming_emi_date") and not user_details.get("passbook_renewal_date"):
            return None

        notifications = []
        action_items = []

        # Check upcoming EMI date
        emi_date = user_details.get("upcoming_emi_date")
        emi_amount = float(user_details.get("upcoming_emi_amount", 0.0))
        if emi_date:
            notifications.append({
                "type": "LOAN_EMI",
                "title": "Upcoming Loan EMI Reminder",
                "message": f"Your monthly micro-loan EMI of ₹{emi_amount:,.2f} is due on {emi_date}.",
                "urgency": "HIGH",
                "action": "Ensure sufficient balance in account or record incoming saree payout.",
            })
            action_items.append(f"Pay ₹{emi_amount:,.2f} EMI by {emi_date}")

        # Check insurance slice deduction
        insurance_due = user_details.get("insurance_slice_due", False)
        if insurance_due:
            notifications.append({
                "type": "INSURANCE_PREMIUM",
                "title": "Monthly PMJJBY / PMSBY Insurance Deduction",
                "message": "Monthly micro-insurance slice (₹36.00) will be automatically split from your next saree payout.",
                "urgency": "MEDIUM",
                "action": "Keep insurance policy status ACTIVE.",
            })

        # Check passbook renewal
        renewal_date = user_details.get("passbook_renewal_date")
        if renewal_date:
            notifications.append({
                "type": "PASSBOOK_RENEWAL",
                "title": "Yarn Passbook Renewal Due",
                "message": f"Your NHDP Yarn Passbook quota renewal is scheduled for {renewal_date}.",
                "urgency": "MEDIUM",
                "action": "Verify current month yarn receipts at your local weavers cooperative.",
            })
            action_items.append(f"Renew Yarn Passbook by {renewal_date}")

        # Process custom list of deadlines if provided
        for item in deadlines:
            if isinstance(item, dict):
                notifications.append({
                    "type": item.get("type", "GENERAL"),
                    "title": item.get("title", "Reminder"),
                    "message": item.get("message", f"Deadline on {item.get('date', 'soon')}"),
                    "urgency": item.get("urgency", "MEDIUM"),
                    "action": item.get("action", "Take required action"),
                })
                action_items.append(f"{item.get('title')}: due {item.get('date')}")

        return {
            "total_notifications": len(notifications),
            "notifications": notifications,
            "action_items": action_items,
            "alert_guidance": "Notifications are automatically synced to your KarghaDhan WhatsApp / SMS vernacular alerts.",
        }


notification_agent = NotificationAgent()
