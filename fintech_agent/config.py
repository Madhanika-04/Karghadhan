import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / '.env')

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
APP_API_KEY = os.getenv('APP_API_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR / "fintech_agent.db"}')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

if OPENAI_API_KEY:
    import openai
    openai.api_key = OPENAI_API_KEY

engine = create_engine(DATABASE_URL, future=True)


def load_prompt(prompt_name: str) -> str:
    prompt_file = BASE_DIR / 'prompts' / f'{prompt_name}.txt'
    if not prompt_file.exists():
        raise FileNotFoundError(f'Prompt file not found: {prompt_file}')
    return prompt_file.read_text(encoding='utf-8').strip()


def validate_environment() -> None:
    missing = []
    if not OPENAI_API_KEY:
        missing.append('OPENAI_API_KEY')
    if not APP_API_KEY:
        missing.append('APP_API_KEY')
    if missing:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")
