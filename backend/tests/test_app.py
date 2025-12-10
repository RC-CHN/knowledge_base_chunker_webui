import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.chunking_service import RuleBasedChunker, SemanticChunker
from app.schemas.process import Chunk


class TestChunkingService(unittest.TestCase):
    def test_fixed_size_chunking(self):
        text = "1234567890"
        chunks = RuleBasedChunker.chunk_by_fixed_size(
            text, chunk_size=5, chunk_overlap=0
        )
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0].content, "12345")
        self.assertEqual(chunks[1].content, "67890")

    def test_fixed_size_chunking_overlap(self):
        text = "1234567890"
        chunks = RuleBasedChunker.chunk_by_fixed_size(
            text, chunk_size=5, chunk_overlap=2
        )
        # 1. 0-5: "12345" (Next start: 3)
        # 2. 3-8: "45678" (Next start: 6)
        # 3. 6-10: "7890" (Next start: 9)
        # 4. 9-10: "0"    (Next start: 12)
        self.assertEqual(len(chunks), 4)
        self.assertEqual(chunks[0].content, "12345")
        self.assertEqual(chunks[1].content, "45678")
        self.assertEqual(chunks[2].content, "7890")
        self.assertEqual(chunks[3].content, "0")

    def test_semantic_chunking(self):
        # Mock EmbeddingClient
        mock_client = MagicMock()
        # Mock embeddings: 3 sentences. 1 and 2 are similar, 3 is different.
        # Vectors: [1, 0], [0.9, 0.1], [0, 1]
        mock_client.get_embeddings.return_value = [[1.0, 0.0], [0.9, 0.1], [0.0, 1.0]]

        chunker = SemanticChunker(mock_client)
        text = "Sentence one. Sentence two. Sentence three."

        # Threshold 0.5. Sim(1,2) ~0.9 > 0.5 (Group). Sim(2,3) ~0.1 < 0.5 (Split).
        # Expected: [S1+S2, S3]
        chunks = chunker.chunk_by_semantics(text, threshold=0.5)

        self.assertEqual(len(chunks), 2)
        self.assertIn("Sentence one", chunks[0].content)
        self.assertIn("Sentence two", chunks[0].content)
        self.assertIn("Sentence three", chunks[1].content)


class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch("app.services.orchestrator.Orchestrator.process")
    def test_process_endpoint(self, mock_process):
        # Mock the orchestrator response
        mock_process.return_value = {
            "chunks": [
                {"content": "chunk1", "original_index": 0},
                {"content": "chunk2", "original_index": 10},
            ],
            "total_chunks": 2,
        }

        response = self.client.post(
            "/api/v1/process/",
            json={
                "text": "some text",
                "chunking_options": {
                    "method": "fixed_size",
                    "chunk_size": 100,
                    "chunk_overlap": 10,
                },
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_chunks"], 2)
        self.assertEqual(len(data["chunks"]), 2)
        self.assertEqual(data["chunks"][0]["content"], "chunk1")


if __name__ == "__main__":
    unittest.main()
