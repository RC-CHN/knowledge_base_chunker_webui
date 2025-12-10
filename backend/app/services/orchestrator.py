from typing import List
from app.schemas.process import ProcessRequest, ProcessResponse, Chunk
from app.services.chunking_service import RuleBasedChunker, SemanticChunker
from app.services.processing_service import ProcessingService
from app.core.embedding_client import EmbeddingClient
from app.core.llm_client import MultimodalLLMClient

class Orchestrator:
    def __init__(self):
        # Initialize clients lazily or here. 
        # For simplicity, we initialize them here, assuming env vars are set.
        try:
            self.embedding_client = EmbeddingClient()
            self.semantic_chunker = SemanticChunker(self.embedding_client)
        except Exception as e:
            print(f"Warning: Could not initialize EmbeddingClient: {e}")
            self.semantic_chunker = None

        try:
            self.llm_client = MultimodalLLMClient()
            self.processing_service = ProcessingService(self.llm_client)
        except Exception as e:
            print(f"Warning: Could not initialize LLMClient: {e}")
            self.processing_service = None

    def process(self, request: ProcessRequest) -> ProcessResponse:
        chunks: List[Chunk] = []
        
        # 1. Chunking Phase
        method = request.chunking_options.method
        chunk_size = request.chunking_options.chunk_size
        chunk_overlap = request.chunking_options.chunk_overlap
        
        if method == "fixed_size":
            chunks = RuleBasedChunker.chunk_by_fixed_size(request.text, chunk_size, chunk_overlap)
        elif method == "semantic":
            if self.semantic_chunker:
                # Note: Semantic chunker might need different params, using defaults/heuristics for now
                chunks = self.semantic_chunker.chunk_by_semantics(request.text)
            else:
                # Fallback
                print("Semantic chunker not available, falling back to fixed size.")
                chunks = RuleBasedChunker.chunk_by_fixed_size(request.text, chunk_size, chunk_overlap)
        elif method == "recursive":
             chunks = RuleBasedChunker.chunk_recursively(request.text, chunk_size, chunk_overlap)
        else:
            # Default fallback
            chunks = RuleBasedChunker.chunk_by_fixed_size(request.text, chunk_size, chunk_overlap)

        # 2. Processing Phase
        if self.processing_service:
            clean = request.processing_options.clean_text
            summarize = request.processing_options.generate_summary
            
            if clean or summarize:
                chunks = self.processing_service.process_chunks(chunks, clean=clean, summarize=summarize)
        
        return ProcessResponse(chunks=chunks, total_chunks=len(chunks))