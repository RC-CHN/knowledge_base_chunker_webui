import re
import os
import asyncio
from typing import List
from app.schemas.process import Chunk
from app.core.llm_client import LLMClient
from app.core.prompts import (
    CLEAN_TEXT_SYSTEM_PROMPT,
    CLEAN_TEXT_USER_PROMPT_TEMPLATE,
    SUMMARIZE_TEXT_SYSTEM_PROMPT,
    SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE
)

class ProcessingService:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        self.concurrency_limit = int(os.getenv("LLM_CONCURRENCY_LIMIT", 5))
        self.semaphore = asyncio.Semaphore(self.concurrency_limit)

    def _extract_content(self, text: str, tag: str) -> str:
        """
        Extract content from XML-like tags.
        """
        pattern = f"<{tag}>(.*?)</{tag}>"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return text.strip()

    async def _clean_chunk_async(self, chunk: Chunk) -> Chunk:
        async with self.semaphore:
            prompt = CLEAN_TEXT_USER_PROMPT_TEMPLATE.format(text=chunk.content)
            # Note: LLMClient is synchronous, so we run it in a thread executor to avoid blocking
            loop = asyncio.get_event_loop()
            cleaned_text_raw = await loop.run_in_executor(
                None,
                self.llm_client.get_completion,
                prompt,
                CLEAN_TEXT_SYSTEM_PROMPT
            )
            chunk.content = self._extract_content(cleaned_text_raw, "cleaned_text")
            return chunk

    async def _generate_summary_async(self, chunk: Chunk) -> Chunk:
        async with self.semaphore:
            prompt = SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE.format(text=chunk.content)
            # Note: LLMClient is synchronous, so we run it in a thread executor to avoid blocking
            loop = asyncio.get_event_loop()
            summary_raw = await loop.run_in_executor(
                None,
                self.llm_client.get_completion,
                prompt,
                SUMMARIZE_TEXT_SYSTEM_PROMPT
            )
            chunk.summary = self._extract_content(summary_raw, "summary")
            return chunk

    def clean_chunk(self, chunk: Chunk) -> Chunk:
        """
        Clean the text of a chunk using LLM (Synchronous wrapper).
        """
        return asyncio.run(self._clean_chunk_async(chunk))

    def generate_summary(self, chunk: Chunk) -> Chunk:
        """
        Generate a summary for the chunk (Synchronous wrapper).
        """
        return asyncio.run(self._generate_summary_async(chunk))

    def process_chunks(self, chunks: List[Chunk], clean: bool = False, summarize: bool = False) -> List[Chunk]:
        """
        Process a list of chunks concurrently.
        """
        return asyncio.run(self._process_chunks_async(chunks, clean, summarize))

    async def _process_chunks_async(self, chunks: List[Chunk], clean: bool = False, summarize: bool = False) -> List[Chunk]:
        tasks = []
        for chunk in chunks:
            task = self._process_single_chunk_async(chunk, clean, summarize)
            tasks.append(task)
        
        return await asyncio.gather(*tasks)

    async def _process_single_chunk_async(self, chunk: Chunk, clean: bool, summarize: bool) -> Chunk:
        if clean:
            chunk = await self._clean_chunk_async(chunk)
        
        if summarize:
            chunk = await self._generate_summary_async(chunk)
            
        return chunk