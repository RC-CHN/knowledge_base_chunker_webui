import unittest
from unittest.mock import MagicMock, patch
import asyncio
from app.services.processing_service import ProcessingService
from app.schemas.process import Chunk
from app.core.llm_client import LLMClient

class TestProcessingService(unittest.TestCase):
    def setUp(self):
        self.mock_llm_client = MagicMock(spec=LLMClient)
        self.processing_service = ProcessingService(self.mock_llm_client)

    def test_extract_content_cleaned_text(self):
        text = "Some noise <cleaned_text>Cleaned content</cleaned_text> more noise"
        extracted = self.processing_service._extract_content(text, "cleaned_text")
        self.assertEqual(extracted, "Cleaned content")

    def test_extract_content_summary(self):
        text = "Here is the summary: <summary>This is a summary.</summary>"
        extracted = self.processing_service._extract_content(text, "summary")
        self.assertEqual(extracted, "This is a summary.")

    def test_extract_content_no_tags(self):
        text = "Just some text without tags."
        extracted = self.processing_service._extract_content(text, "cleaned_text")
        self.assertEqual(extracted, "Just some text without tags.")

    def test_clean_chunk_async(self):
        chunk = Chunk(content="Dirty text", original_index=0)
        self.mock_llm_client.get_completion.return_value = "<cleaned_text>Cleaned text</cleaned_text>"
        
        # Run async method in sync context
        cleaned_chunk = asyncio.run(self.processing_service._clean_chunk_async(chunk))
        
        self.assertEqual(cleaned_chunk.content, "Cleaned text")
        self.mock_llm_client.get_completion.assert_called_once()

    def test_generate_summary_async(self):
        chunk = Chunk(content="Some content", original_index=0)
        self.mock_llm_client.get_completion.return_value = "<summary>Summary text</summary>"
        
        # Run async method in sync context
        summarized_chunk = asyncio.run(self.processing_service._generate_summary_async(chunk))
        
        self.assertEqual(summarized_chunk.summary, "Summary text")
        self.mock_llm_client.get_completion.assert_called_once()

if __name__ == '__main__':
    unittest.main()