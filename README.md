# Knowledge Base Chunker WebUI

这是一个用于 RAG (Retrieval-Augmented Generation) 系统的知识库分块处理工具。它提供了一个直观的 Web 界面，用于上传文档、配置分块策略（如语义分块或规则分块），并预览分块结果。

## ✨ 功能特性

*   **多种分块策略**：
    *   **语义分块 (Semantic Chunking)**：利用 Embedding 模型计算文本相似度，智能识别语义边界进行分块。
    *   **规则分块 (Rule-Based Chunking)**：支持固定大小分块和递归字符分块。
*   **多格式支持**：支持处理 PDF、Word (Docx) 等常见文档格式。
*   **可视化界面**：基于 React + Ant Design 的现代化前端界面，操作便捷。
*   **RESTful API**：基于 FastAPI 构建的高性能后端接口。

## 🚀 快速开始 (Docker)

使用 Docker Compose 可以一键启动整个应用。

1.  **克隆项目**

    ```bash
    git clone <repository_url>
    cd knowledge_base_chunker_webui
    ```

2.  **配置环境变量**

    复制后端示例配置文件：

    ```bash
    cp backend/.env.example backend/.env
    ```

    编辑 `backend/.env` 文件，填入你的 API Key (主要用于语义分块时的 Embedding 计算)：

    ```env
    EMBEDDING_API_KEY=your_api_key
    EMBEDDING_BASE_URL=https://api.openai.com/v1
    EMBEDDING_MODEL_NAME=text-embedding-3-small
    ```

3.  **启动服务**

    ```bash
    docker-compose up -d
    ```

    启动后，访问以下地址：
    *   **Web 界面**: [http://localhost:3000](http://localhost:3000)
    *   **API 文档**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🛠️ 本地开发指南

如果你需要进行二次开发，可以分别启动前后端服务。

### 后端 (Backend)

后端使用 Python 3.11+ 和 FastAPI。

1.  **进入后端目录**

    ```bash
    cd backend
    ```

2.  **创建并激活虚拟环境**

    推荐使用 `uv` 或 `venv`。

    ```bash
    # 使用 venv
    python -m venv .venv
    source .venv/bin/activate  # Linux/macOS
    # .venv\Scripts\activate   # Windows
    ```

3.  **安装依赖**

    ```bash
    pip install -e .
    # 或者如果使用 uv
    # uv sync
    ```

4.  **配置环境变量**

    确保 `backend/.env` 文件已配置（参考上方 Docker 部分）。

5.  **启动后端服务**

    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

### 前端 (Frontend)

前端使用 React, TypeScript 和 Vite。

1.  **进入前端目录**

    ```bash
    cd frontend
    ```

2.  **安装依赖**

    ```bash
    npm install
    ```

3.  **启动开发服务器**

    ```bash
    npm run dev
    ```

    访问 [http://localhost:5173](http://localhost:5173) (Vite 默认端口，Docker 中映射为 3000)。

## ⚙️ 环境变量说明

在 `backend/.env` 中配置以下变量：

| 变量名 | 说明 | 默认值/示例 |
|--------|------|-------------|
| `EMBEDDING_API_KEY` | Embedding 服务 API 密钥 (必需) | `sk-...` |
| `EMBEDDING_BASE_URL` | Embedding 服务 Base URL | `https://api.openai.com/v1` |
| `EMBEDDING_MODEL_NAME` | 使用的 Embedding 模型名称 | `text-embedding-3-small` |
| `LLM_API_KEY` | LLM 服务 API 密钥 (可选，视功能而定) | `sk-...` |
| `LLM_BASE_URL` | LLM 服务 Base URL | `https://api.openai.com/v1` |
| `LLM_MODEL_NAME` | LLM 模型名称 | `gpt-4o` |

## 📄 License

MIT