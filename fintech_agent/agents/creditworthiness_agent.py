from typing import Optional

from models.request import FinancialContext
from tools.creditworthiness import evaluate_creditworthiness


class CreditworthinessAgent:
    name = 'creditworthiness_agent'

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        if not context:
            return (
                'No Yarn Passbook financial data was provided. Please share structured financial details like income, expenses, savings, transaction consistency, and banking history.'
            )

        metrics = evaluate_creditworthiness(context)
        lines = [
            f"AI Creditworthiness Score: {metrics['creditworthiness_score']}/100",
            f"Risk Level: {metrics['risk_level']}",
            '',
            'Financial health:',
        ]

        for label, value in metrics['financial_health'].items():
            lines.append(f"- {label.replace('_', ' ').title()}: {value}")

        lines.extend(['', 'Loan recommendation:'])
        loan = metrics['loan_recommendation']
        lines.append(f"- Eligible: {'Yes' if loan['eligible'] else 'No'}")
        lines.append(f"- Recommended amount: ₹{loan['recommended_amount']:,}")
        lines.append(f"- Recommended EMI: ₹{loan['recommended_emi']:,}")
        lines.append(f"- Recommended tenure: {loan['recommended_tenure_months']} months")
        lines.append(f"- Approval confidence: {loan['approval_confidence']}%")

        lines.extend(['', 'Strengths:'])
        lines.extend([f"- {item}" for item in metrics['strengths']])

        lines.extend(['', 'Risks:'])
        lines.extend([f"- {item}" for item in metrics['risks']])

        lines.extend(['', f"Recommendation: {metrics['recommendation']}"])
        return '\n'.join(lines)
