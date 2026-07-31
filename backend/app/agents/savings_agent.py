"""
app/agents/savings_agent.py
Savings Agent for KarghaDhan.
Builds micro-savings plans (Thrift Fund model), calculates emergency fund targets, and provides budgeting and financial protection guidance.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are a financial savings and budgeting advisor for unorganized handloom weavers. 
Help weavers build emergency thrift funds, automate micro-savings from saree sales, and plan financial goals."""


class SavingsAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="savings_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic savings plan computation.
        """
        if not user_details and not message:
            return None

        monthly_income = float(user_details.get("monthly_income", user_details.get("income_total", 16000.0)))
        monthly_expenses = float(user_details.get("monthly_expenses", user_details.get("expense_total", 10000.0)))
        current_savings = float(user_details.get("total_savings_balance", 0.0))
        contribution_pct = float(user_details.get("monthly_contribution_pct", 5.0))

        net_monthly_surplus = max(0.0, monthly_income - monthly_expenses)
        auto_thrift_monthly = round(monthly_income * (contribution_pct / 100.0), 2)

        # Target Emergency Fund = 3 months of essential expenses
        target_emergency_fund = round(monthly_expenses * 3.0, 2)
        savings_gap = max(0.0, target_emergency_fund - current_savings)
        months_to_target = round(savings_gap / auto_thrift_monthly, 1) if auto_thrift_monthly > 0 else 0.0

        budgeting_breakdown = {
            "yarn_and_living_needs_60pct": round(monthly_income * 0.60, 2),
            "loom_maintenance_and_expenses_30pct": round(monthly_income * 0.30, 2),
            "automated_thrift_savings_10pct": round(monthly_income * 0.10, 2),
        }

        budgeting_tips = [
            f"Divert {contribution_pct}% of each informal saree payout automatically into your emergency thrift fund.",
            "Separate raw material yarn expenditure from household personal expenses.",
            "Reinvest matching bonuses from cooperative societies directly into loom accessories.",
            "Maintain at least 3 months of basic living expenses in liquid thrift savings to handle seasonal monsoon slumps.",
        ]

        return {
            "current_savings_balance_inr": current_savings,
            "monthly_income_inr": monthly_income,
            "net_monthly_surplus_inr": net_monthly_surplus,
            "thrift_contribution_pct": contribution_pct,
            "estimated_monthly_thrift_savings_inr": auto_thrift_monthly,
            "target_emergency_fund_inr": target_emergency_fund,
            "remaining_savings_gap_inr": savings_gap,
            "estimated_months_to_target": months_to_target,
            "suggested_budget_split": budgeting_breakdown,
            "budgeting_tips": budgeting_tips,
            "savings_summary": (
                f"With a {contribution_pct}% automated thrift deduction from payouts, "
                f"you save approximately ₹{auto_thrift_monthly:,.2f} per month toward your ₹{target_emergency_fund:,.2f} emergency fund."
            ),
        }


savings_agent = SavingsAgent()
