from typing import Optional
from .base_agent import BaseAgent
from models.request import FinancialContext


class LiteracyAgent(BaseAgent):
    name = 'literacy_agent'

    def __init__(self) -> None:
        super().__init__('literacy_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        prompt = message.lower()
        if 'credit score' in prompt:
            return self._explain_credit_score()
        if 'interest rate' in prompt or 'interest' in prompt:
            return self._explain_interest_rate()
        if 'fraud' in prompt:
            return self._explain_fraud_prevention()
        if 'digital payment' in prompt or 'digital payments' in prompt:
            return self._explain_digital_payments()
        return None

    def _explain_credit_score(self) -> str:
        return '\n'.join([
            'Financial literacy explanation:',
            '- A credit score is a number that represents your creditworthiness based on past borrowing and repayment behavior.',
            '- Lenders use it to decide whether to approve loans and at what interest rate.',
            '- Improve it by paying bills on time, keeping debt low, and maintaining a stable credit history.',
        ])

    def _explain_interest_rate(self) -> str:
        return '\n'.join([
            'Financial literacy explanation:',
            '- An interest rate is the cost of borrowing money, expressed as a percentage of the amount borrowed.',
            '- Higher interest rates mean higher monthly payments and more total cost over time.',
            '- Compare rates across lenders and choose the lowest affordable option.',
        ])

    def _explain_fraud_prevention(self) -> str:
        return '\n'.join([
            'Financial literacy explanation:',
            '- Fraud means someone is trying to steal your money or personal information.',
            '- Protect yourself by verifying contacts, using strong passwords, and avoiding suspicious links.',
            '- Report any unauthorized activity to your bank immediately.',
        ])

    def _explain_digital_payments(self) -> str:
        return '\n'.join([
            'Financial literacy explanation:',
            '- Digital payments let you send and receive money using apps or online services.',
            '- Use secure networks, protect your login details, and verify the recipient before sending money.',
            '- Keep transaction alerts enabled so you can spot any unexpected activity.',
        ])
