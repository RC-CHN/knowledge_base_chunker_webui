from typing import List
from app.schemas.process import Chunk
from app.core.llm_client import MultimodalLLMClient
from app.core.prompts import (
    CLEAN_TEXT_SYSTEM_PROMPT,
    CLEAN_TEXT_USER_PROMPT_TEMPLATE,
    SUMMARIZE_TEXT_SYSTEM_PROMPT,
    SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE
)

class ProcessingService:
    def __init__(self, llm_client: MultimodalLLMClient):
        self.llm_client = llm_client

    def clean_chunk(self, chunk: Chunk) -> Chunk:
        """
        Clean the text of a chunk using LLM.
        """
        prompt = CLEAN_TEXT_USER_PROMPT_TEMPLATE.format(text=chunk.content)
        
        cleaned_text = self.llm_client.get_completion(prompt, system_prompt=CLEAN_TEXT_SYSTEM_PROMPT)
        chunk.content = cleaned_text
        return chunk

    def generate_summary(self, chunk: Chunk) -> Chunk:
        """
        Generate a summary for the chunk.
        """
        prompt = SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE.format(text=chunk.content)
        
        summary = self.llm_client.get_completion(prompt, system_prompt=SUMMARIZE_TEXT_SYSTEM_PROMPT)
        chunk.summary = summary
        return chunk

    def process_chunks(self, chunks: List[Chunk], clean: bool = False, summarize: bool = False) -> List[Chunk]:
        """
        Process a list of chunks.
        """
        processed_chunks = []
        for chunk in chunks:
            if clean:
                chunk = self.clean_chunk(chunk)
            
            if summarize:
                chunk = self.generate_summary(chunk)
                
            processed_chunks.append(chunk)
            
        return processed_chunks