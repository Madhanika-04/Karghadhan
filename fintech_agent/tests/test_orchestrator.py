from unittest.mock import Mock, patch
from models.request import FinancialContext, UserRequest
from orchestrator import Orchestrator


def test_orchestrator_selects_loan_agent() -> None:
    mock_chat = Mock()
    mock_completion = Mock()
    mock_completion.choices = [Mock(message={'content': 'Loan response'})]
    mock_chat.completions.create.return_value = mock_completion
    mock_openai_client = Mock(chat=mock_chat)

    with patch('agents.base_agent.openai.OpenAI', return_value=mock_openai_client):
        orchestrator = Orchestrator()
        request = UserRequest(
            user_id='123',
            message='I need a loan for my small business',
            context=FinancialContext(loan_amount=250000, interest_rate=9.5, duration_months=36),
        )

        response = orchestrator.process_request(request)

    assert response.agent == 'loan_agent'
    assert isinstance(response.response, str)
    assert 'Loan recommendation summary:' in response.response
    assert '- Monthly EMI:' in response.response
