from typing import Optional
from .base_agent import BaseAgent
from models.request import FinancialContext


class SavingsAgent(BaseAgent):
    name = 'savings_agent'

    def __init__(self) -> None:
        super().__init__('savings_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        if not context:
            return None

        income = context.monthly_income or (context.income / 12 if context.income else None)
        expenses = context.monthly_expenses or context.expenses
        if income is None or expenses is None:
            return None

        return self._build_savings_plan(income, expenses, context.monthly_savings, context)

    def _build_savings_plan(self, income: float, expenses: float, savings: Optional[float], context: FinancialContext) -> str:
        saving_rate = (savings / income) * 100 if savings is not None else 0.0
        plan = [
            'Savings plan summary:',
            f'- Monthly income: ₹{income:,.2f}',
            f'- Monthly expenses: ₹{expenses:,.2f}',
        ]

        if savings is not None:
            plan.append(f'- Monthly savings: ₹{savings:,.2f} ({saving_rate:.1f}% of income)')
        else:
            plan.append('- Monthly savings: Not provided')

        if expenses > income:
            plan.append('- Your current expenses exceed your income; reduce discretionary spending immediately.')
        elif saving_rate < 10:
            plan.append('- Aim to increase savings to at least 10% of monthly income.')
        else:
            plan.append('- Your savings rate is healthy; continue building an emergency fund.')

        plan.extend(['', 'Budgeting tips:'])
        plan.append('- Track essential expenses first, then limit discretionary spending.')
        if context.monthly_savings is None:
            plan.append('- Set a target savings amount based on income and expenses.')
        plan.append('- Automate transfers to savings when income arrives.')

        plan.extend(['', 'Goal recommendation:'])
        if context.goals:
            plan.append(f'- Goal: {context.goals}')
            plan.append('- Break the goal into monthly contributions and review progress every month.')
        else:
            plan.append('- Establish a clear savings goal such as emergency funds, education, or business capital.')

        return '\n'.join(plan)
