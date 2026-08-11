from typing import Optional, List, Dict
from .base_agent import BaseAgent
from models.request import FinancialContext


class InsuranceAgent(BaseAgent):
    name = 'insurance_agent'

    def __init__(self) -> None:
        super().__init__('insurance_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        if context and self._has_sufficient_context(context):
            return self._build_recommendation_response(context)
        return None

    def _has_sufficient_context(self, context: FinancialContext) -> bool:
        return any(
            getattr(context, field) is not None
            for field in [
                'income',
                'monthly_income',
                'expenses',
                'monthly_savings',
                'employment_status',
                'goals',
                'scheme_preferences',
            ]
        )

    def _build_recommendation_response(self, context: FinancialContext) -> str:
        recommendations = self._select_recommendations(context)
        if not recommendations:
            return (
                'Based on the provided details, I recommend considering core insurance categories such as health, life, and business insurance. '
                'Please provide more specific financial goals or risk concerns for a tailored recommendation.'
            )

        lines: List[str] = [
            'Recommended insurance categories:',
        ]

        for recommendation in recommendations:
            lines.append(f"- {recommendation['name']}: {recommendation['reason']}")

        lines.extend(['', 'Why this is recommended:'])
        for recommendation in recommendations:
            lines.append(f"- {recommendation['name']}: {recommendation['explanation']}")

        lines.extend(['', 'Coverage guidance:'])
        lines.append('Compare policy limits, premiums, deductibles, and exclusions before choosing a plan.')
        lines.append('Consider working with a licensed insurer or broker to confirm eligibility and pricing.')
        return '\n'.join(lines)

    def _select_recommendations(self, context: FinancialContext) -> List[Dict[str, str]]:
        recommendations: List[Dict[str, str]] = []

        if self._recommend_health(context):
            recommendations.append(
                {
                    'name': 'Health Insurance',
                    'reason': 'Protects against unexpected medical costs and is a core safeguard for most people.',
                    'explanation': 'Health cover helps you manage hospital, surgery, and treatment expenses, which can quickly become unaffordable without insurance.',
                }
            )

        if self._recommend_life(context):
            recommendations.append(
                {
                    'name': 'Life Insurance',
                    'reason': 'Provides financial protection for dependents if your income stops unexpectedly.',
                    'explanation': 'Life insurance can replace lost income, pay outstanding debts, and secure long-term goals for family members.',
                }
            )

        if self._recommend_business(context):
            recommendations.append(
                {
                    'name': 'Business Insurance',
                    'reason': 'Protects your small business or self-employment income against liability, fire, or loss.',
                    'explanation': 'Business insurance helps cover property loss, liability, and operational disruptions that could affect your ability to earn.',
                }
            )

        if self._recommend_government_scheme(context):
            recommendations.append(
                {
                    'name': 'Government Insurance Scheme',
                    'reason': 'May offer lower-cost coverage or subsidies for eligible low-income or informal-sector workers.',
                    'explanation': 'Government-supported plans often provide affordable benefits for health or life cover to people with limited formal insurance access.',
                }
            )

        return recommendations

    def _recommend_health(self, context: FinancialContext) -> bool:
        return True

    def _recommend_life(self, context: FinancialContext) -> bool:
        has_income = bool(context.monthly_income or context.income)
        has_dependents_hint = bool(context.goals and any(term in context.goals.lower() for term in ['family', 'depend', 'children', 'spouse']))
        return has_income or has_dependents_hint

    def _recommend_business(self, context: FinancialContext) -> bool:
        if context.employment_status:
            status_lower = context.employment_status.lower()
            if any(term in status_lower for term in ['business', 'self-employed', 'entrepreneur', 'vendor', 'trader', 'shop']):
                return True

        if context.goals:
            goals_lower = context.goals.lower()
            if any(term in goals_lower for term in ['business', 'shop', 'store', 'entrepreneur', 'vendor']):
                return True

        return False

    def _recommend_government_scheme(self, context: FinancialContext) -> bool:
        if context.scheme_preferences and 'government' in context.scheme_preferences.lower():
            return True

        if context.monthly_income is not None and context.monthly_income < 20000:
            return True

        if context.income is not None and context.income < 20000:
            return True

        return False

    def _has_sufficient_context(self, context: FinancialContext) -> bool:
        return any(
            getattr(context, field) is not None
            for field in [
                'income',
                'monthly_income',
                'expenses',
                'monthly_savings',
                'employment_status',
                'goals',
                'scheme_preferences',
            ]
        )

    def _build_recommendation_response(self, context: FinancialContext) -> str:
        recommendations = self._select_recommendations(context)
        if not recommendations:
            return (
                'Based on the provided details, I recommend considering core insurance categories such as health, life, and business insurance. '  # noqa: E501
                'Please provide more specific financial goals or risk concerns for a tailored recommendation.'
            )

        lines: List[str] = [
            'Recommended insurance categories:',
        ]

        for recommendation in recommendations:
            lines.append(f"- {recommendation['name']}: {recommendation['reason']}")

        lines.extend(['', 'Why this is recommended:'])
        for recommendation in recommendations:
            lines.append(f"- {recommendation['name']}: {recommendation['explanation']}")

        lines.extend(['', 'Coverage guidance:'])
        lines.append('Compare policy limits, premiums, deductibles, and exclusions before choosing a plan.')
        lines.append('Consider working with a licensed insurer or broker to confirm eligibility and pricing.')
        return '\n'.join(lines)

    def _select_recommendations(self, context: FinancialContext) -> List[Dict[str, str]]:
        recommendations: List[Dict[str, str]] = []

        if self._recommend_health(context):
            recommendations.append(
                {
                    'name': 'Health Insurance',
                    'reason': 'Protects against unexpected medical costs and is a core safeguard for most people.',
                    'explanation': 'Health cover helps you manage hospital, surgery, and treatment expenses, which can quickly become unaffordable without insurance.',
                }
            )

        if self._recommend_life(context):
            recommendations.append(
                {
                    'name': 'Life Insurance',
                    'reason': 'Provides financial protection for dependents if your income stops unexpectedly.',
                    'explanation': 'Life insurance can replace lost income, pay outstanding debts, and secure long-term goals for family members.',
                }
            )

        if self._recommend_business(context):
            recommendations.append(
                {
                    'name': 'Business Insurance',
                    'reason': 'Protects your small business or self-employment income against liability, fire, or loss.',
                    'explanation': 'Business insurance helps cover property loss, liability, and operational disruptions that could affect your ability to earn.',
                }
            )

        if self._recommend_government_scheme(context):
            recommendations.append(
                {
                    'name': 'Government Insurance Scheme',
                    'reason': 'May offer lower-cost coverage or subsidies for eligible low-income or informal-sector workers.',
                    'explanation': 'Government-supported plans often provide affordable benefits for health or life cover to people with limited formal insurance access.',
                }
            )

        return recommendations

    def _recommend_health(self, context: FinancialContext) -> bool:
        return True

    def _recommend_life(self, context: FinancialContext) -> bool:
        has_income = bool(context.monthly_income or context.income)
        has_dependents_hint = bool(context.goals and any(term in context.goals.lower() for term in ['family', 'depend', 'children', 'spouse']))
        return has_income or has_dependents_hint

    def _recommend_business(self, context: FinancialContext) -> bool:
        if context.employment_status:
            status_lower = context.employment_status.lower()
            if any(term in status_lower for term in ['business', 'self-employed', 'entrepreneur', 'vendor', 'trader', 'shop']):
                return True

        if context.goals:
            goals_lower = context.goals.lower()
            if any(term in goals_lower for term in ['business', 'shop', 'store', 'entrepreneur', 'vendor']):
                return True

        return False

    def _recommend_government_scheme(self, context: FinancialContext) -> bool:
        if context.scheme_preferences and 'government' in context.scheme_preferences.lower():
            return True

        if context.monthly_income is not None and context.monthly_income < 20000:
            return True

        if context.income is not None and context.income < 20000:
            return True

        return False
