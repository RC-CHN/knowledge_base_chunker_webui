from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(
    title="Knowledge Base Chunker API",
    description="API for chunking and processing text for RAG systems.",
    version="0.1.0",
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Knowledge Base Chunker API"}