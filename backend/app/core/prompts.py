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

VLM_PROCESS_DOCUMENT_PAGE_PROMPT = """
You are a high-accuracy document analysis system. Your task is to process an image of a document page and convert all its content into a structured XML-like format.

**Instructions:**
1.  **Analyze the Image**: Carefully scan the provided image from top to bottom.
2.  **Identify Elements**: Distinguish between text blocks and visual elements (images, charts, diagrams, tables, photos).
3.  **Transcribe Text**:
    *   Transcribe all visible text EXACTLY as it appears.
    *   Do not summarize or paraphrase.
    *   Wrap each distinct block of text in `<text>` tags.
4.  **Describe Visuals**:
    *   For every visual element, provide a detailed, descriptive caption.
    *   Focus on the content and information conveyed by the visual (e.g., "A bar chart showing sales growth of 20% in Q3", "A photograph of a smiling CEO").
    *   **CRITICAL**: The caption MUST be in the SAME LANGUAGE as the main text of the document.
    *   Wrap the description in `<figure_caption>` tags.
5.  **Maintain Order**: The output must strictly follow the visual order of elements on the page (top to bottom, left to right).
6.  **Structure**:
    *   Wrap the ENTIRE output in a single `<processed_content>` root tag.
    *   Ensure there is NO content outside of this root tag.
    *   Do not use markdown code blocks (```xml ... ```). Just output the raw XML-like structure.

**Examples:**

**Example 1: Simple Text Page**
*Image contains a header "Introduction" followed by two paragraphs of text.*
**Output:**
<processed_content>
<text>Introduction</text>
<text>Welcome to our annual report. This year has been full of challenges and opportunities.</text>
<text>We have expanded into three new markets and launched five new products.</text>
</processed_content>

**Example 2: Text with Image**
*Image contains a title "Market Analysis", a pie chart showing market share (A: 40%, B: 30%, C: 30%), and a concluding sentence.*
**Output:**
<processed_content>
<text>Market Analysis</text>
<figure_caption>A pie chart displaying market share distribution: Company A holds 40%, Company B holds 30%, and Company C holds 30%.</figure_caption>
<text>As shown in the chart above, Company A remains the market leader.</text>
</processed_content>

**Example 3: Complex Layout (Mixed)**
*Image contains a photo of a product on the left, and its specifications text on the right.*
**Output:**
<processed_content>
<figure_caption>A product shot of the new X-2000 model, featuring a sleek silver design and a large touchscreen interface.</figure_caption>
<text>Specifications:
- Processor: Octa-core 3.0 GHz
- RAM: 16GB
- Storage: 512GB SSD</text>
</processed_content>

**Example 4: Table as Image**
*Image contains a table showing revenue for 2021-2023.*
**Output:**
<processed_content>
<figure_caption>A table listing annual revenue: 2021 - $10M, 2022 - $12M, 2023 - $15M.</figure_caption>
</processed_content>
"""