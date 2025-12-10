from typing import List
import numpy as np
from app.schemas.process import Chunk
from app.core.embedding_client import EmbeddingClient

class SemanticChunker:
    def __init__(self, embedding_client: EmbeddingClient):
        self.embedding_client = embedding_client

    def chunk_by_semantics(self, text: str, threshold: float = 0.5) -> List[Chunk]:
        """
        Chunk text based on semantic similarity.
        This is a simplified implementation. A real one would split by sentences first.
        """
        # 1. Split text into sentences (simple split by period for MVP)
        sentences = [s.strip() + "." for s in text.split(".") if s.strip()]
        if not sentences:
            return []

        # 2. Get embeddings for all sentences
        embeddings = self.embedding_client.get_embeddings(sentences)
        
        if len(embeddings) < 2:
             return [Chunk(content=text, original_index=0)]

        # 3. Calculate cosine similarity between adjacent sentences
        similarities = []
        for i in range(len(embeddings) - 1):
            sim = np.dot(embeddings[i], embeddings[i+1]) / (np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[i+1]))
            similarities.append(sim)

        # 4. Group sentences based on similarity threshold
        chunks = []
        current_chunk_sentences = [sentences[0]]
        current_start_index = 0
        current_char_count = 0
        
        for i, sim in enumerate(similarities):
            if sim < threshold:
                # Break point found
                chunk_content = " ".join(current_chunk_sentences)
                chunks.append(Chunk(content=chunk_content, original_index=current_start_index))
                
                # Reset for next chunk
                current_start_index += len(chunk_content) + 1 # +1 for space/separator approximation
                current_chunk_sentences = [sentences[i+1]]
            else:
                current_chunk_sentences.append(sentences[i+1])
        
        # Add the last chunk
        if current_chunk_sentences:
            chunk_content = " ".join(current_chunk_sentences)
            chunks.append(Chunk(content=chunk_content, original_index=current_start_index))
            
        return chunks

class RuleBasedChunker:
    @staticmethod
    def chunk_by_fixed_size(text: str, chunk_size: int, chunk_overlap: int) -> List[Chunk]:
        """
        Chunk text by fixed size with overlap.
        """
        if not text:
            return []
            
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunk_content = text[start:end]
            
            chunks.append(Chunk(
                content=chunk_content,
                original_index=start
            ))
            
            start += chunk_size - chunk_overlap
            
            # Prevent infinite loop if overlap >= chunk_size
            if chunk_overlap >= chunk_size:
                start += 1 # Force progress
                
        return chunks

    @staticmethod
    def chunk_recursively(text: str, chunk_size: int, chunk_overlap: int) -> List[Chunk]:
        """
        Recursive character text splitter logic (simplified).
        Prioritizes splitting by paragraphs, then sentences, then words.
        """
        # For MVP, we can implement a simpler version or use a library like langchain's splitter logic
        # Here is a simple implementation that splits by newlines first
        
        separators = ["\n\n", "\n", " ", ""]
        
        def _split_text(text: str, separators: List[str]) -> List[str]:
            final_chunks = []
            separator = separators[-1]
            new_separators = []
            
            for i, sep in enumerate(separators):
                if sep == "":
                    separator = ""
                    break
                if sep in text:
                    separator = sep
                    new_separators = separators[i+1:]
                    break
            
            splits = text.split(separator) if separator else list(text)
            
            good_splits = []
            for split in splits:
                if len(split) < chunk_size:
                    good_splits.append(split)
                else:
                    if new_separators:
                        good_splits.extend(_split_text(split, new_separators))
                    else:
                        good_splits.append(split)
                        
            return good_splits

        # This is a placeholder for a more robust recursive splitter
        # For now, let's fallback to fixed size for simplicity in this step
        return RuleBasedChunker.chunk_by_fixed_size(text, chunk_size, chunk_overlap)