import io
import re
import os
import logging
import asyncio
import fitz  # PyMuPDF
import docx
from fastapi import UploadFile
from app.core.llm_client import VLMClient
from app.core.prompts import VLM_PROCESS_DOCUMENT_PAGE_PROMPT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileProcessingService:
    def __init__(self):
        self.vlm_client = VLMClient()
        self.concurrency_limit = int(os.getenv("VLM_CONCURRENCY_LIMIT", 5))
        self.semaphore = asyncio.Semaphore(self.concurrency_limit)

    def _parse_vlm_output(self, vlm_output: str) -> str:
        """
        Parse the XML-like output from VLM and convert it to plain text.
        <text>content</text> -> content
        <figure_caption>content</figure_caption> -> [Image: content]
        """
        # Remove the root tag
        content = re.sub(r'<processed_content>\s*', '', vlm_output)
        content = re.sub(r'\s*</processed_content>', '', content)
        
        # Process text tags
        # We use a loop to handle multiple text blocks
        def replace_text(match):
            return match.group(1).strip() + "\n\n"
        
        content = re.sub(r'<text>(.*?)</text>', replace_text, content, flags=re.DOTALL)
        
        # Process figure_caption tags
        def replace_caption(match):
            return f"[Image: {match.group(1).strip()}]\n\n"
            
        content = re.sub(r'<figure_caption>(.*?)</figure_caption>', replace_caption, content, flags=re.DOTALL)
        
        # Clean up extra newlines
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        return content.strip()

    async def process_file(self, file: UploadFile) -> str:
        logger.info(f"Starting processing for file: {file.filename}")
        content = await file.read()
        filename = file.filename.lower()

        try:
            if filename.endswith('.pdf'):
                result = await self._process_pdf(content)
            elif filename.endswith('.docx'):
                result = await self._process_docx(content)
            elif filename.endswith('.txt') or filename.endswith('.md') or filename.endswith('.csv') or filename.endswith('.json'):
                result = content.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {filename}")
            
            logger.info(f"Successfully processed file: {file.filename}")
            return result
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {e}")
            raise e

    async def _process_pdf_page(self, page_num: int, img_data: bytes) -> str:
        async with self.semaphore:
            try:
                logger.info(f"Calling VLM for page {page_num + 1}")
                # Note: LLMClient is synchronous, so we run it in a thread executor to avoid blocking
                loop = asyncio.get_event_loop()
                vlm_output = await loop.run_in_executor(
                    None,
                    self.vlm_client.get_image_caption,
                    img_data,
                    VLM_PROCESS_DOCUMENT_PAGE_PROMPT
                )
                parsed_text = self._parse_vlm_output(vlm_output)
                logger.info(f"Finished VLM for page {page_num + 1}")
                return f"--- Page {page_num + 1} ---\n{parsed_text}\n"
            except Exception as e:
                logger.error(f"Error processing page {page_num + 1}: {e}")
                return f"--- Page {page_num + 1} (Error) ---\n[Error processing page: {e}]\n"

    async def _process_pdf(self, content: bytes) -> str:
        doc = fitz.open(stream=content, filetype="pdf")
        total_pages = len(doc)
        logger.info(f"Processing PDF with {total_pages} pages")
        
        tasks = []
        for page_num, page in enumerate(doc):
            # Render page to image
            # zoom=2 for better resolution for OCR
            matrix = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=matrix)
            img_data = pix.tobytes("png")
            
            tasks.append(self._process_pdf_page(page_num, img_data))
            
        results = await asyncio.gather(*tasks)
        return "\n".join(results)

    async def _process_docx_image(self, index: int, image_data: bytes) -> str:
        async with self.semaphore:
            try:
                logger.info(f"Processing image {index+1} in DOCX")
                # Note: LLMClient is synchronous, so we run it in a thread executor to avoid blocking
                loop = asyncio.get_event_loop()
                vlm_output = await loop.run_in_executor(
                    None,
                    self.vlm_client.get_image_caption,
                    image_data,
                    VLM_PROCESS_DOCUMENT_PAGE_PROMPT
                )
                parsed_caption = self._parse_vlm_output(vlm_output)
                logger.info(f"Finished processing image {index+1}")
                return parsed_caption
            except Exception as e:
                logger.error(f"Failed to process image {index+1} in DOCX: {e}")
                return f"[Error processing image {index+1}: {e}]"

    async def _process_docx(self, content: bytes) -> str:
        logger.info("Processing DOCX file")
        # python-docx is synchronous and CPU bound, so we run it in executor
        loop = asyncio.get_event_loop()
        doc = await loop.run_in_executor(None, lambda: docx.Document(io.BytesIO(content)))
        
        full_text = []
        
        # Extract text from paragraphs
        logger.info("Extracting text from paragraphs")
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        
        # Extract images and caption them
        logger.info("Scanning for images in DOCX")
        image_tasks = []
        
        for i, rel in enumerate(doc.part.rels.values()):
            if "image" in rel.target_ref:
                try:
                    image_data = rel.target_part.blob
                    image_tasks.append(self._process_docx_image(i, image_data))
                except Exception as e:
                    logger.error(f"Failed to extract image data for image {i+1}: {e}")

        if image_tasks:
            image_captions = await asyncio.gather(*image_tasks)
            full_text.append("\n--- Extracted Images Content ---\n")
            full_text.extend(image_captions)
            
        return "\n".join(full_text)