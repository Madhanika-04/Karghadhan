import logging
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import APP_API_KEY, LOG_LEVEL, validate_environment
from models.request import AgentResponse, UserRequest
from orchestrator import Orchestrator

logger = logging.getLogger('fintech_agent')
logger.setLevel(LOG_LEVEL)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s - %(message)s'))
logger.addHandler(handler)

app = FastAPI(
    title='FINTECH_AGENT',
    description='A modular AI fintech agent ecosystem for loan, savings, insurance, scheme discovery, literacy, and reminders.',
    version='1.0.0',
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

orchestrator = Orchestrator()


@app.on_event('startup')
def startup_event() -> None:
    try:
        validate_environment()
        logger.info('FINTECH_AGENT startup complete.')
    except EnvironmentError as exc:
        logger.error('Environment validation failed: %s', exc)
        raise


@app.get('/')
def root() -> dict:
    return {'service': 'FINTECH_AGENT', 'status': 'ok'}


@app.post('/agent/query', response_model=AgentResponse)
def query_agent(payload: UserRequest, x_api_key: str = Header(..., alias='x-api-key')) -> AgentResponse:
    if x_api_key != APP_API_KEY:
        logger.warning('Unauthorized access attempt with invalid API key.')
        raise HTTPException(status_code=401, detail='Invalid API key.')

    try:
        response = orchestrator.process_request(payload)
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Agent query failed: %s', exc)
        raise HTTPException(status_code=500, detail='Unable to process request at this time.')
