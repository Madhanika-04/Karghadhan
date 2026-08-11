from typing import Dict


def calculate_emi(loan_amount: float, annual_interest_rate: float, duration_months: int) -> Dict[str, float]:
    if loan_amount <= 0:
        raise ValueError('Loan amount must be positive.')
    if duration_months <= 0:
        raise ValueError('Loan duration must be greater than zero months.')
    if annual_interest_rate < 0:
        raise ValueError('Interest rate cannot be negative.')

    monthly_rate = annual_interest_rate / 1200.0
    if monthly_rate == 0:
        monthly_emi = loan_amount / duration_months
    else:
        numerator = loan_amount * monthly_rate * (1 + monthly_rate) ** duration_months
        denominator = (1 + monthly_rate) ** duration_months - 1
        monthly_emi = numerator / denominator

    total_payment = monthly_emi * duration_months
    total_interest = total_payment - loan_amount

    return {
        'monthly_emi': round(monthly_emi, 2),
        'total_payment': round(total_payment, 2),
        'total_interest': round(total_interest, 2),
    }
