CLEAN_TEXT_SYSTEM_PROMPT = "You are a helpful editor. Your task is to clean the provided text while preserving its original meaning and language."
CLEAN_TEXT_USER_PROMPT_TEMPLATE = """
Please clean the following text.
1. Fix grammar and spelling errors.
2. Remove irrelevant noise, such as page numbers, headers, footers, or random characters.
3. Ensure the text is coherent and flows well.
4. Do not change the core meaning of the text.
5. **CRITICAL**: Output the cleaned text in the SAME LANGUAGE as the original text.
6. **CRITICAL**: Do NOT use Markdown formatting (e.g., bold, italic, headers) in the output.
7. **CRITICAL**: Wrap the cleaned text in <cleaned_text> tags.

Here are some examples:

Example 1:
Text:
Ths is a smple txt with some errrs. [Noise]
Output:
<cleaned_text>
This is a simple text with some errors.
</cleaned_text>

Example 2:
Text:
The quick brown fox... jumps over the lazy dog. (Source: Wikipedia)
Output:
<cleaned_text>
The quick brown fox jumps over the lazy dog.
</cleaned_text>

Example 3 (Chinese):
Text:
这是一个简单的文本，有一些错误。[噪音]
Output:
<cleaned_text>
这是一个简单的文本，有一些错误。
</cleaned_text>

Text:
{text}
"""

SUMMARIZE_TEXT_SYSTEM_PROMPT = "You are a helpful summarizer. Your task is to provide a concise summary of the text in the same language as the original text."
SUMMARIZE_TEXT_USER_PROMPT_TEMPLATE = """
Please provide a concise summary of the following text.
1. Capture the main points and key ideas.
2. Keep the summary brief and to the point.
3. **CRITICAL**: Output the summary in the SAME LANGUAGE as the original text.
4. **CRITICAL**: Do NOT use Markdown formatting (e.g., bold, italic, headers) in the output.
5. **CRITICAL**: Wrap the summary in <summary> tags.

Here are some examples:

Example 1:
Text:
Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.
Output:
<summary>
AI is machine intelligence that perceives its environment and takes actions to achieve goals, distinct from natural intelligence.
</summary>

Example 2:
Text:
Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water.
Output:
<summary>
Photosynthesis converts light energy into chemical energy stored in carbohydrates like sugars, fueling organism activities.
</summary>

Example 3 (Chinese):
Text:
人工智能（AI）是机器展示的智能，与包括人类在内的动物展示的自然智能相对。AI研究被定义为智能代理的研究领域，指任何感知环境并采取行动以最大化实现目标机会的系统。
Output:
<summary>
人工智能是机器智能，通过感知环境并采取行动来实现目标，区别于自然智能。
</summary>

Text:
{text}
"""