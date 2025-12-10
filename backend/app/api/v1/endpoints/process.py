import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.schemas.process import (
    ProcessRequest,
    ProcessResponse,
    Chunk,
    ChunkActionRequest,
)
from app.services.orchestrator import Orchestrator
from app.services.file_processing_service import FileProcessingService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_orchestrator():
    return Orchestrator()


def get_file_processing_service():
    return FileProcessingService()


@router.post("/", response_model=ProcessResponse)
async def process_text(
    request: ProcessRequest, orchestrator: Orchestrator = Depends(get_orchestrator)
):
    """
    Process text: chunk, clean, and summarize.
    """
    try:
        return await orchestrator.process(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chunk", response_model=Chunk)
async def process_chunk(
    request: ChunkActionRequest, orchestrator: Orchestrator = Depends(get_orchestrator)
):
    """
    Process a single chunk (clean or summarize).
    """
    try:
        return await orchestrator.process_single_chunk(request.chunk, request.action)
    except Exception as e:
        logger.error(f"Error processing chunk: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload_file")
async def upload_file(
    file: UploadFile = File(...),
    file_service: FileProcessingService = Depends(get_file_processing_service),
):
    """
    Upload and process a file (PDF, DOCX, TXT, MD, CSV, JSON).
    Returns the extracted text content.
    """
    try:
        content = await file_service.process_file(file)
        return {"content": content}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
