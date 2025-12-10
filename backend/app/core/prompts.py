CLEAN_TEXT_SYSTEM_PROMPT = "You are a helpful editor."
CLEAN_TEXT_USER_PROMPT_TEMPLATE = """
Please clean the following text. Fix grammar, remove irrelevant noise, and ensure it is coherent. 
Do not change the core meaning.

Text:
{text}
"""

SUMMARIZE_TEXT_SYSTEM_PROMPT = "You are a helpful summarizer."
SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE = """
Please provide a concise summary of the following text.

Text:
{text}
"""