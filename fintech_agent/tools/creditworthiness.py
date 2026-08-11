from typing import Any, Dict, Optional

from models.request import FinancialContext


def _clamp_score(score: float) -> int:
    return max(0, min(100, round(score)))


def _format_ratio(value: Optional[float]) -> str:
    return f"{round(value * 100, 1)}%" if value is not None else 'N/A'


def _safe_ratio(numerator: Optional[float], denominator: Optional[float]) -> Optional[float]:
    if numerator is None or denominator is None or denominator == 0:
        return None
    return numerator / denominator


def _score_income_stability(context: FinancialContext) -> int:
    score = 0
    freq = (context.salary_or_business_credit_frequency or '').strip().lower()
    consistency = context.transaction_consistency

    if freq in {'monthly', 'weekly', 'bi-weekly', 'biweekly'}:
        score += 10
    elif freq in {'quarterly', 'annual', 'annually'}:
        score += 5

    if consistency is not None:
        if consistency >= 0.9:
            score += 10
        elif consistency >= 0.75:
            score += 6
        elif consistency >= 0.6:
            score += 3

    return score


def _score_savings_behavior(context: FinancialContext) -> int:
    ratio = _safe_ratio(context.monthly_savings, context.monthly_income)
    if ratio is None:
        return 0
    if ratio >= 0.25:
        return 15
    if ratio >= 0.15:
        return 12
    if ratio >= 0.08:
        return 8
    if ratio >= 0.05:
        return 4
    return 0


def _score_dti(context: FinancialContext) -> int:
    dti = _safe_ratio(context.existing_emi, context.monthly_income)
    if dti is None:
        return 0
    if dti < 0.3:
        return 12
    if dti <= 0.5:
        return 6
    return -10


def _score_average_balance(context: FinancialContext) -> int:
    ratio = _safe_ratio(context.average_balance, context.monthly_income)
    if ratio is None:
        return 0
    if ratio >= 0.5:
        return 10
    if ratio >= 0.25:
        return 6
    return 1


def _score_transaction_consistency(context: FinancialContext) -> int:
    consistency = context.transaction_consistency
    if consistency is None:
        return 0
    if consistency >= 0.9:
        return 8
    if consistency >= 0.75:
        return 5
    if consistency >= 0.6:
        return 2
    return -5


def _score_defaults_and_bounces(context: FinancialContext) -> int:
    score = 0
    if context.loan_defaults is not None:
        if context.loan_defaults == 0:
            score += 5
        elif context.loan_defaults == 1:
            score -= 12
        else:
            score -= 20

    if context.bounce_transactions is not None:
        if context.bounce_transactions == 0:
            score += 3
        elif context.bounce_transactions <= 2:
            score -= 5
        elif context.bounce_transactions <= 4:
            score -= 10
        else:
            score -= 18

    return score


def _score_banking_history(context: FinancialContext) -> int:
    months = context.banking_history_months
    if months is None:
        return 0
    if months >= 36:
        return 8
    if months >= 24:
        return 5
    if months >= 12:
        return 3
    return 0


def _risk_level(score: int) -> str:
    if score >= 90:
        return 'Excellent'
    if score >= 75:
        return 'Good'
    if score >= 60:
        return 'Fair'
    if score >= 40:
        return 'Needs Improvement'
    return 'High Risk'


def _approval_confidence(score: int, has_required_data: bool) -> int:
    if not has_required_data:
        return 25
    if score >= 90:
        return 92
    if score >= 75:
        return 82
    if score >= 60:
        return 68
    if score >= 50:
        return 52
    return 30


def evaluate_creditworthiness(context: FinancialContext) -> Dict[str, Any]:
    score = 50
    score += _score_income_stability(context)
    score += _score_savings_behavior(context)
    score += _score_dti(context)
    score += _score_average_balance(context)
    score += _score_transaction_consistency(context)
    score += _score_defaults_and_bounces(context)
    score += _score_banking_history(context)
    score = _clamp_score(score)

    dti_ratio = _safe_ratio(context.existing_emi, context.monthly_income)
    available_buffer = None
    if context.monthly_income is not None:
        available_buffer = context.monthly_income - (context.monthly_expenses or 0.0) - (context.existing_emi or 0.0)

    has_required_data = context.monthly_income is not None and context.monthly_expenses is not None
    eligible = False
    recommended_amount = 0
    recommended_emi = 0
    recommended_tenure_months = 0

    if has_required_data and available_buffer is not None and available_buffer > 0:
        monthly_limit = min(context.monthly_income * 0.25, available_buffer * 0.75)
        if monthly_limit >= max(1000.0, context.monthly_income * 0.1):
            recommended_emi = round(monthly_limit, 2)
            recommended_tenure_months = 36 if score >= 70 else 24 if score >= 55 else 18
            recommended_amount = int(round(recommended_emi * recommended_tenure_months))
            eligible = score >= 50 and (context.loan_defaults or 0) == 0 and available_buffer > 0

    result = {
        'creditworthiness_score': score,
        'risk_level': _risk_level(score),
        'financial_health': {
            'income_stability': 'Excellent' if _score_income_stability(context) >= 15 else 'Good' if _score_income_stability(context) >= 10 else 'Fair' if _score_income_stability(context) >= 6 else 'Needs Improvement',
            'savings_behavior': 'Excellent' if _score_savings_behavior(context) >= 12 else 'Good' if _score_savings_behavior(context) >= 8 else 'Fair' if _score_savings_behavior(context) >= 4 else 'Needs Improvement',
            'debt_to_income_ratio': _format_ratio(dti_ratio) if dti_ratio is not None else 'N/A',
            'average_balance': 'Healthy' if _score_average_balance(context) >= 6 else 'Moderate' if _score_average_balance(context) >= 1 else 'Low',
            'transaction_consistency': 'Very High' if (context.transaction_consistency or 0) >= 0.9 else 'High' if (context.transaction_consistency or 0) >= 0.75 else 'Moderate' if (context.transaction_consistency or 0) >= 0.6 else 'Low',
            'banking_history': f"{int(context.banking_history_months)} Months" if context.banking_history_months is not None else 'N/A',
        },
        'loan_recommendation': {
            'eligible': eligible,
            'recommended_amount': recommended_amount,
            'recommended_emi': int(round(recommended_emi)) if recommended_emi else 0,
            'recommended_tenure_months': recommended_tenure_months,
            'approval_confidence': _approval_confidence(score, has_required_data),
        },
        'strengths': [],
        'risks': [],
        'recommendation': '',
    }

    if context.transaction_consistency is not None and context.transaction_consistency >= 0.9:
        result['strengths'].append('Transactions are very consistent, indicating stable cash flow.')
    if _safe_ratio(context.monthly_savings, context.monthly_income) is not None and context.monthly_savings >= 0:
        result['strengths'].append('The user is saving regularly from income.')
    if dti_ratio is not None and dti_ratio < 0.3:
        result['strengths'].append('Debt burden is low compared to income.')
    if available_buffer is not None and available_buffer > 0:
        result['strengths'].append('Available monthly buffer supports loan repayment.')

    if context.loan_defaults is not None and context.loan_defaults > 0:
        result['risks'].append('There are past loan defaults, which raise risk.')
    if context.bounce_transactions is not None and context.bounce_transactions > 0:
        result['risks'].append('Bounced transactions indicate potential cash-flow issues.')
    if dti_ratio is not None and dti_ratio >= 0.5:
        result['risks'].append('Debt-to-income ratio is high and may affect repayment capacity.')
    if available_buffer is not None and available_buffer <= 0:
        result['risks'].append('Monthly expenses and existing EMI leave little or no repayment buffer.')

    if not result['strengths']:
        result['strengths'].append('More consistent income information would help improve the score.')
    if not result['risks']:
        result['risks'].append('Maintain payment discipline and avoid defaults to keep the score strong.')

    explanation = []
    explanation.append(f"Your AI Creditworthiness Score is {score} out of 100.")
    explanation.append(f"Risk level is {result['risk_level']}.")

    if not has_required_data:
        explanation.append('Some financial details are missing, so the recommendation is based on available data only.')
    elif not eligible:
        explanation.append('The current data suggests this borrower is not yet ideal for a larger loan; improve savings, reduce expenses, or clear existing obligations first.')
    else:
        explanation.append(
            f"You may be eligible for a loan of about ₹{recommended_amount:,} with an EMI around ₹{int(round(recommended_emi))} per month over {recommended_tenure_months} months."
        )

    result['recommendation'] = ' '.join(explanation)
    return result
