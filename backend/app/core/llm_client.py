import os
import base64
import logging
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("LLM_API_KEY")
        self.base_url = base_url or os.getenv("LLM_BASE_URL")
        self.model_name = model_name or os.getenv("LLM_MODEL_NAME", "gpt-4o")

        if not self.api_key:
            raise ValueError("LLM_API_KEY is not set and not provided.")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def get_completion(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        """
        Get text completion from the LLM.
        """
        try:
            logger.info(f"Sending request to LLM: {self.model_name}")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            logger.info("Received response from LLM")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error getting completion: {e}")
            raise e

class VLMClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("VLM_API_KEY")
        self.base_url = base_url or os.getenv("VLM_BASE_URL")
        self.model_name = model_name or os.getenv("VLM_MODEL_NAME", "gpt-4o")

        if not self.api_key:
            raise ValueError("VLM_API_KEY is not set and not provided.")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def get_image_caption(self, image_bytes: bytes, prompt: str = "Describe this image in detail.") -> str:
        """
        Get caption/description for an image.
        """
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            logger.info(f"Sending request to VLM: {self.model_name}")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ]
            )
            logger.info("Received response from VLM")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error getting image caption: {e}")
            raise e

if __name__ == "__main__":
    # Simple test
    try:
        client = LLMClient()
        print("Testing text completion...")
        response = client.get_completion("Say hello!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Test failed: {e}")