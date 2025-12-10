from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class ChunkingOptions(BaseModel):
    method: Literal["fixed_size", "semantic", "recursive"] = Field(
        default="fixed_size", description="The chunking method to use."
    )
    chunk_size: int = Field(
        default=500, description="The target size of each chunk (in characters)."
    )
    chunk_overlap: int = Field(
        default=50, description="The number of overlapping characters between chunks."
    )
    semantic_threshold: Optional[float] = Field(
        default=0.5,
        description="The similarity threshold for semantic chunking (0.0 to 1.0).",
    )
    separators: Optional[List[str]] = Field(
        default=None, description="List of separators for recursive chunking."
    )


class ProcessingOptions(BaseModel):
    clean_text: bool = Field(
        default=False, description="Whether to use LLM to clean the text."
    )
    generate_summary: bool = Field(
        default=False, description="Whether to generate a summary for each chunk."
    )


class ProcessRequest(BaseModel):
    text: str = Field(..., description="The input text to process.")
    chunking_options: ChunkingOptions = Field(default_factory=ChunkingOptions)
    processing_options: ProcessingOptions = Field(default_factory=ProcessingOptions)


class Chunk(BaseModel):
    content: str = Field(..., description="The content of the chunk.")
    original_index: int = Field(
        ..., description="The starting index of the chunk in the original text."
    )
    summary: Optional[str] = Field(
        None, description="The summary of the chunk (if generated)."
    )
    token_count: Optional[int] = Field(
        None, description="The estimated token count of the chunk."
    )


class ProcessResponse(BaseModel):
    chunks: List[Chunk] = Field(..., description="The list of processed chunks.")
    total_chunks: int = Field(..., description="The total number of chunks.")


class ChunkActionRequest(BaseModel):
    chunk: Chunk
    action: Literal["clean", "summarize"]
