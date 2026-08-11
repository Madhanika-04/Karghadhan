from typing import Optional
from .base_agent import BaseAgent
from models.request import FinancialContext
from tools.emi_calculator import calculate_emi


class LoanAgent(BaseAgent):
    name = 'loan_agent'

    def __init__(self) -> None:
        super().__init__('loan_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        if not context:
            return None

        if context.loan_amount is not None and context.interest_rate is not None and context.duration_months is not None:
            return self._build_loan_summary(context)

        return None

    def _build_loan_summary(self, context: FinancialContext) -> str:
        try:
            emi = calculate_emi(context.loan_amount, context.interest_rate, context.duration_months)
        except ValueError as exc:
            return f'EMI calculation requires valid positive loan details. {exc}'

        income = context.monthly_income or (context.income / 12 if context.income else None)
        total_emi = emi['monthly_emi'] + (context.existing_emi or 0)
        eligibility_lines = []

        if income is not None:
            ratio = (total_emi / income) * 100
            eligibility_lines.append(f'- Estimated debt-to-income ratio: {ratio:.1f}%')
            if ratio < 40:
                eligibility_lines.append('- Your EMI obligations are within a healthy range relative to monthly income.')
            else:
                eligibility_lines.append('- Your EMI obligations are relatively high; consider reducing other debts or refinancing.')
        else:
            eligibility_lines.append('- Provide monthly income details for a better eligibility estimate.')

        lines = [
            'Loan recommendation summary:',
            f"- Requested loan amount: ₹{context.loan_amount:,.0f}",
            f"- Interest rate: {context.interest_rate:.2f}%",
            f"- Tenure: {context.duration_months} months",
            f"- Monthly EMI: ₹{emi['monthly_emi']:.2f}",
            f"- Total payment: ₹{emi['total_payment']:.2f}",
            f"- Total interest: ₹{emi['total_interest']:.2f}",
            '',
            'Eligibility guidance:',
        ]
        lines.extend(eligibility_lines)
        lines.extend([
            '',
            'Recommendation:',
            '- Review your monthly cash flow before taking on new EMI commitments.',
            '- Compare loan offers and verify terms with a licensed lender.',
        ])

        return '\n'.join(lines)
