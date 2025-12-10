from fastapi import APIRouter, HTTPException, Depends
from app.schemas.process import ProcessRequest, ProcessResponse
from app.services.orchestrator import Orchestrator

router = APIRouter()

# Dependency injection for Orchestrator could be more sophisticated in a larger app
def get_orchestrator():
    return Orchestrator()

@router.post("/", response_model=ProcessResponse)
async def process_text(request: ProcessRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    try:
        return orchestrator.process(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))