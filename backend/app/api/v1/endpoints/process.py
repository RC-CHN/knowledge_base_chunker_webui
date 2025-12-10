from fastapi import APIRouter, HTTPException, Depends
from app.schemas.process import ProcessRequest, ProcessResponse, ProcessChunkRequest, Chunk
from app.services.orchestrator import Orchestrator

router = APIRouter()

# Dependency injection for Orchestrator could be more sophisticated in a larger app
def get_orchestrator():
    return Orchestrator()

@router.post("/", response_model=ProcessResponse)
async def process_text(request: ProcessRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    try:
        return await orchestrator.process(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chunk", response_model=Chunk)
async def process_single_chunk(request: ProcessChunkRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    try:
        return await orchestrator.process_single_chunk(request.chunk, request.action)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))