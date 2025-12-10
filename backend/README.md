# Knowledge Base Chunker Backend

这是一个为 RAG (Retrieval-Augmented Generation) 系统设计的预处理后端服务。它提供了灵活的文本切分（Chunking）和清洗功能，支持规则切分和基于语义的切分。

## 功能特性

*   **多种切分策略**:
    *   **Fixed Size**: 按固定字符数切分，支持重叠。
    *   **Semantic**: 基于 Embedding 语义相似度进行智能断句。
    *   **Recursive**: (基础实现) 递归字符切分。
*   **智能处理**:
    *   **LLM Cleaning**: 使用 LLM 清洗文本噪音。
    *   **Summarization**: 为每个 Chunk 生成摘要。
*   **多模态支持**:
    *   内置多模态 LLM 客户端，支持图片 Caption 生成（代码已预留，可扩展接口）。
*   **高度可配置**:
    *   完全兼容 OpenAI 接口格式，支持任意兼容的 LLM/Embedding 提供商（如 DeepSeek, Moonshot, LocalAI 等）。

## 快速开始

### 1. 环境准备

确保已安装 Python 3.10+ 和 `uv` (推荐) 或 `pip`。

```bash
cd backend
# 使用 uv (推荐)
uv sync
# 或者使用 pip
pip install -r requirements.txt # 如果你生成了 requirements.txt
```

### 2. 配置环境变量

复制示例配置文件并填入您的 API Key 和 Base URL。

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```ini
# Embedding Configuration
EMBEDDING_API_KEY=sk-xxxx
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL_NAME=text-embedding-3-small

# LLM Configuration
LLM_API_KEY=sk-xxxx
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4o
```

### 3. 运行服务

```bash
uv run uvicorn app.main:app --reload
```

服务将在 `http://127.0.0.1:8000` 启动。

## API 文档

启动服务后，访问 `http://127.0.0.1:8000/docs` 查看完整的 Swagger API 文档。

### 核心接口: `POST /api/v1/process`

**请求示例:**

```json
{
  "text": "这里是需要处理的长文本...",
  "chunking_options": {
    "method": "semantic",
    "chunk_size": 500,
    "chunk_overlap": 50
  },
  "processing_options": {
    "clean_text": true,
    "generate_summary": false
  }
}