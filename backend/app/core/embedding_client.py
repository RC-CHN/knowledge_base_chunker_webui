import os
import logging
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("EMBEDDING_API_KEY")
        self.base_url = base_url or os.getenv("EMBEDDING_BASE_URL")
        self.model_name = model_name or os.getenv("EMBEDDING_MODEL_NAME", "text-embedding-3-small")

        if not self.api_key:
            raise ValueError("EMBEDDING_API_KEY is not set and not provided.")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Get embeddings for a list of texts.
        """
        if not texts:
            return []

        # OpenAI API handles batching, but for very large lists we might want to chunk it manually.
        # For now, we assume the input list size is reasonable.
        try:
            logger.info(f"Getting embeddings for {len(texts)} texts using {self.model_name}")
            response = self.client.embeddings.create(
                input=texts,
                model=self.model_name
            )
            logger.info("Successfully retrieved embeddings")
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.error(f"Error getting embeddings: {e}")
            raise e

if __name__ == "__main__":
    # Simple test
    try:
        client = EmbeddingClient()
        embeddings = client.get_embeddings(["Hello world", "This is a test"])
        print(f"Successfully got {len(embeddings)} embeddings.")
        print(f"Embedding dimension: {len(embeddings[0])}")
    except Exception as e:
        print(f"Test failed: {e}")