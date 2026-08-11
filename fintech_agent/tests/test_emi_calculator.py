from tools.emi_calculator import calculate_emi


def test_calculate_emi_zero_interest() -> None:
    result = calculate_emi(120000, 0, 12)

    assert result['monthly_emi'] == 10000.0
    assert result['total_payment'] == 120000.0
    assert result['total_interest'] == 0.0


def test_calculate_emi_positive_interest() -> None:
    result = calculate_emi(500000, 10.5, 48)

    assert result['monthly_emi'] > 0
    assert result['total_payment'] >= 500000
    assert result['total_interest'] >= 0
