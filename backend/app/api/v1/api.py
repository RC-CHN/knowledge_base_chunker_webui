from fastapi import APIRouter
from app.api.v1.endpoints import process

api_router = APIRouter()
api_router.include_router(process.router, prefix="/process", tags=["process"])
