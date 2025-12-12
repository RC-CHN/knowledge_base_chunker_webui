import logging
from typing import List
from app.schemas.process import ProcessRequest, ProcessResponse, Chunk
from app.services.chunking_service import RuleBasedChunker, SemanticChunker
from app.services.processing_service import ProcessingService
from app.core.embedding_client import EmbeddingClient
from app.core.llm_client import LLMClient
import tiktoken

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Orchestrator:
    def __init__(self):
        # Initialize clients lazily or here.
        # For simplicity, we initialize them here, assuming env vars are set.
        try:
            self.embedding_client = EmbeddingClient()
            self.semantic_chunker = SemanticChunker(self.embedding_client)
        except Exception as e:
            logger.warning(f"Could not initialize EmbeddingClient: {e}")
            self.semantic_chunker = None

        try:
            self.llm_client = LLMClient()
            self.processing_service = ProcessingService(self.llm_client)
        except Exception as e:
            logger.warning(f"Could not initialize LLMClient: {e}")
            self.processing_service = None

        try:
            self.tokenizer = tiktoken.get_encoding(
                "cl100k_base"
            )  # Default for GPT-4/3.5
        except Exception as e:
            logger.warning(f"Could not initialize tokenizer: {e}")
            self.tokenizer = None

    def _count_tokens(self, text: str) -> int:
        if self.tokenizer:
            return len(self.tokenizer.encode(text))
        return 0

    async def process(self, request: ProcessRequest) -> ProcessResponse:
        logger.info(f"Starting processing request. Text length: {len(request.text)}")
        chunks: List[Chunk] = []

        # 1. Chunking Phase
        method = request.chunking_options.method
        chunk_size = request.chunking_options.chunk_size
        chunk_overlap = request.chunking_options.chunk_overlap

        logger.info(
            f"Chunking method: {method}, Size: {chunk_size}, Overlap: {chunk_overlap}"
        )

        if method == "fixed_size":
            chunks = RuleBasedChunker.chunk_by_fixed_size(
                request.text, chunk_size, chunk_overlap
            )
        elif method == "semantic":
            if self.semantic_chunker:
                threshold = request.chunking_options.semantic_threshold or 0.5
                chunks = self.semantic_chunker.chunk_by_semantics(
                    request.text, threshold=threshold
                )
            else:
                # Fallback
                logger.warning(
                    "Semantic chunker not available, falling back to fixed size."
                )
                chunks = RuleBasedChunker.chunk_by_fixed_size(
                    request.text, chunk_size, chunk_overlap
                )
        elif method == "recursive":
            separators = request.chunking_options.separators
            chunks = RuleBasedChunker.chunk_recursively(
                request.text, chunk_size, chunk_overlap, separators=separators
            )
        else:
            # Default fallback
            chunks = RuleBasedChunker.chunk_by_fixed_size(
                request.text, chunk_size, chunk_overlap
            )

        logger.info(f"Generated {len(chunks)} chunks")

        # 2. Processing Phase
        if self.processing_service:
            clean = request.processing_options.clean_text
            summarize = request.processing_options.generate_summary

            if clean or summarize:
                logger.info(f"Processing chunks: Clean={clean}, Summarize={summarize}")
                chunks = await self.processing_service.process_chunks(
                    chunks, clean=clean, summarize=summarize
                )

        # 3. Token Counting
        for chunk in chunks:
            chunk.token_count = self._count_tokens(chunk.content)

        logger.info("Processing complete")
        return ProcessResponse(chunks=chunks, total_chunks=len(chunks))

    async def process_stream(self, request: ProcessRequest):
        logger.info(f"Starting streaming processing request. Text length: {len(request.text)}")
        chunks: List[Chunk] = []

        # 1. Chunking Phase
        method = request.chunking_options.method
        chunk_size = request.chunking_options.chunk_size
        chunk_overlap = request.chunking_options.chunk_overlap

        if method == "fixed_size":
            chunks = RuleBasedChunker.chunk_by_fixed_size(
                request.text, chunk_size, chunk_overlap
            )
        elif method == "semantic":
            if self.semantic_chunker:
                threshold = request.chunking_options.semantic_threshold or 0.5
                chunks = self.semantic_chunker.chunk_by_semantics(
                    request.text, threshold=threshold
                )
            else:
                chunks = RuleBasedChunker.chunk_by_fixed_size(
                    request.text, chunk_size, chunk_overlap
                )
        elif method == "recursive":
            separators = request.chunking_options.separators
            chunks = RuleBasedChunker.chunk_recursively(
                request.text, chunk_size, chunk_overlap, separators=separators
            )
        else:
            chunks = RuleBasedChunker.chunk_by_fixed_size(
                request.text, chunk_size, chunk_overlap
            )

        logger.info(f"Generated {len(chunks)} chunks")

        # Yield initial chunks info
        yield {"type": "progress", "total_chunks": len(chunks), "processed_chunks": 0}

        # 2. Processing Phase
        if self.processing_service:
            clean = request.processing_options.clean_text
            summarize = request.processing_options.generate_summary

            if clean or summarize:
                processed_count = 0
                async for processed_chunk in self.processing_service.process_chunks_stream(
                    chunks, clean=clean, summarize=summarize
                ):
                    processed_chunk.token_count = self._count_tokens(processed_chunk.content)
                    processed_count += 1
                    yield {
                        "type": "chunk",
                        "chunk": processed_chunk.model_dump(),
                        "processed_chunks": processed_count,
                        "total_chunks": len(chunks)
                    }
            else:
                # If no processing needed, just yield chunks
                for i, chunk in enumerate(chunks):
                    chunk.token_count = self._count_tokens(chunk.content)
                    yield {
                        "type": "chunk",
                        "chunk": chunk.model_dump(),
                        "processed_chunks": i + 1,
                        "total_chunks": len(chunks)
                    }
        else:
             for i, chunk in enumerate(chunks):
                chunk.token_count = self._count_tokens(chunk.content)
                yield {
                    "type": "chunk",
                    "chunk": chunk.model_dump(),
                    "processed_chunks": i + 1,
                    "total_chunks": len(chunks)
                }

    async def process_single_chunk(self, chunk: Chunk, action: str) -> Chunk:
        if not self.processing_service:
            raise Exception("Processing service not available")

        if action == "clean":
            chunk = await self.processing_service.clean_chunk(chunk)
        elif action == "summarize":
            chunk = await self.processing_service.generate_summary(chunk)
        else:
            raise ValueError(f"Invalid action: {action}")

        # Recount tokens if content changed (cleaning)
        if action == "clean":
            chunk.token_count = self._count_tokens(chunk.content)

        return chunk
