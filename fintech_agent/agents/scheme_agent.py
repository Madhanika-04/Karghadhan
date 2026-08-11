from typing import Optional, List, Dict
from .base_agent import BaseAgent
from models.request import FinancialContext


class SchemeAgent(BaseAgent):
    name = 'scheme_agent'

    def __init__(self) -> None:
        super().__init__('scheme_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        intent_keywords = ['scheme', 'subsidy', 'government', 'msme', 'benefits']
        if context or any(keyword in message.lower() for keyword in intent_keywords):
            return self._build_scheme_recommendations(context, message)
        return None

    def _build_scheme_recommendations(self, context: Optional[FinancialContext], message: str) -> str:
        scheme_options = self._select_schemes(context, message)
        if not scheme_options:
            return (
                'Based on the request, I recommend exploring government schemes for small businesses and low-income households. '
                'Share additional details such as business type, income, or eligibility requirements for more specific guidance.'
            )

        lines: List[str] = [
            'Recommended schemes:',
        ]
        for scheme in scheme_options:
            lines.append(f"- {scheme['name']}: {scheme['reason']}")

        lines.extend(['', 'Eligibility and benefits:'])
        for scheme in scheme_options:
            lines.append(f"- {scheme['name']}: {scheme['benefits']}")

        lines.extend(['', 'Next steps:'])
        lines.append('Verify eligibility on the official scheme portal and prepare the required documents such as identity, income proof, and business registration.')
        lines.append('Consult a local government office or MSME support center for application assistance.')

        return '\n'.join(lines)

    def _select_schemes(self, context: Optional[FinancialContext], message: str) -> List[Dict[str, str]]:
        recommendations: List[Dict[str, str]] = []
        text = message.lower()

        if context:
            if context.scheme_preferences and 'government' in context.scheme_preferences.lower():
                recommendations.append(
                    {
                        'name': 'PM SVANidhi',
                        'reason': 'Support for street vendors and informal business owners.',
                        'benefits': 'Provides working capital loans and digital transactions incentives.',
                    }
                )

            if context.employment_status:
                status_lower = context.employment_status.lower()
                if any(term in status_lower for term in ['self-employed', 'entrepreneur', 'vendor', 'trader', 'shop']):
                    recommendations.append(
                        {
                            'name': 'MSME Support Scheme',
                            'reason': 'Helps small businesses access credit, subsidies, and training.',
                            'benefits': 'Offers loan guarantees, reduced interest support, and business development assistance.',
                        }
                    )

            if context.monthly_income is not None and context.monthly_income < 20000:
                recommendations.append(
                    {
                        'name': 'Ayushman Bharat Health Protection Scheme',
                        'reason': 'Affordable health coverage for low-income households.',
                        'benefits': 'Covers hospitalization expenses and critical illness care.',
                    }
                )

            if context.goals and 'startup' in context.goals.lower():
                recommendations.append(
                    {
                        'name': 'PMEGP',
                        'reason': 'Helps new small enterprises start and scale their business.',
                        'benefits': 'Provides subsidized credit and project support for entrepreneurs.',
                    }
                )

        if not recommendations:
            if 'msme' in text or 'business' in text:
                recommendations.append(
                    {
                        'name': 'MSME Support Scheme',
                        'reason': 'Suitable for small enterprises and self-employed business owners.',
                        'benefits': 'Offers credit support and capacity-building for micro and small enterprises.',
                    }
                )
            if 'government' in text or 'subsidy' in text:
                recommendations.append(
                    {
                        'name': 'PM SVANidhi',
                        'reason': 'Designed for informal sector workers and low-income entrepreneurs.',
                        'benefits': 'Provides working capital loans and rewards for digital transactions.',
                    }
                )

        return recommendations
