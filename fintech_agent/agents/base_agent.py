import openai
from typing import Optional
from config import load_prompt, OPENAI_MODEL
from models.request import FinancialContext


class BaseAgent:
    def __init__(self, prompt_name: str) -> None:
        self.system_prompt = load_prompt(prompt_name)
        self.client = openai.OpenAI()

    def respond(self, message: str, context: Optional[FinancialContext] = None) -> str:
        built = self._build_response(message, context)
        if built is not None:
            return built
        return self._llm_response(message, context)

    def _build_response(self, message: str, context: Optional[FinancialContext]) -> Optional[str]:
        raise NotImplementedError

    def _llm_response(self, message: str, context: Optional[FinancialContext] = None) -> str:
        user_content = message
        if context:
            user_content += "\n\nFinancial context:\n"
            user_content += context.model_dump_json(indent=2)

        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': user_content},
        ]

        completion = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=700,
            temperature=0.7,
        )

        return completion.choices[0].message['content'].strip()
