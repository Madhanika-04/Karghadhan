from typing import Optional
from .base_agent import BaseAgent
from models.request import FinancialContext


class NotificationAgent(BaseAgent):
    name = 'notification_agent'

    def __init__(self) -> None:
        super().__init__('notification_prompt')

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        if context and context.deadlines:
            return self._build_notification(context.deadlines)
        return None

    def _build_notification(self, deadlines: dict) -> str:
        lines = ['Reminder:']
        for label, due_date in deadlines.items():
            lines.append(f'- {label}: {due_date}')

        lines.extend([
            '',
            'Action items:',
            '- Confirm the deadline and prepare the required documents or payments.',
            '- Set a calendar reminder or notification well before the due date.',
        ])

        return '\n'.join(lines)
