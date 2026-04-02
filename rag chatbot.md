# RAG Chatbot for College ERP — Implementation Plan

## Background & Goal

Build an **AI-powered RAG (Retrieval-Augmented Generation) chatbot** for the existing College ERP system. The chatbot will:

1. **Answer questions** using documents vectorized from Google Drive (college circulars, policies, syllabi, scholarship info, etc.)
2. **Serve downloadable documents** (e.g. scholarship PDFs, forms) directly to users
3. **Scale to 3,000 concurrent users** (college-wide deployment)
4. Be **learner-friendly** in architecture but **production-ready** when needed

### Your Existing Stack
| Layer | Tech |
|---|---|
| **Backend** | Node.js + Express 5, MySQL (mysql2), JWT auth |
| **Frontend** | React 19 + TypeScript, Vite, TailwindCSS, Radix UI, shadcn/ui |
| **Auth** | Dual JWT tokens (access + refresh), bcrypt |

---

## Architecture Overview

We'll add a **Python microservice** alongside your existing Node.js backend. Python is the best choice for RAG because LangChain, vector databases, and embeddings libraries are all Python-first.

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌──────────────┐  ┌────────────────────────────────┐   │
│  │ Existing ERP │  │  ChatBot Widget (floating btn)  │   │
│  │   Pages      │  │  - Chat UI with message bubbles │   │
│  │              │  │  - File download links           │   │
│  │              │  │  - Streaming responses            │   │
│  └──────────────┘  └────────────────────────────────┘   │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
            ▼                      ▼
┌──────────────────┐    ┌─────────────────────────────┐
│  Node.js Backend │    │  Python RAG Service (FastAPI) │
│  (Existing ERP)  │    │  ┌─────────────────────────┐ │
│  - Auth, CRUD    │    │  │ /api/chat               │ │
│  - JWT verify    │◄───│  │ /api/chat/stream        │ │
│                  │    │  │ /api/documents/search    │ │
│                  │    │  │ /api/documents/download  │ │
│                  │    │  │ /api/ingest/trigger      │ │
│                  │    │  └─────────────┬───────────┘ │
└──────────────────┘    │               │              │
                        │  ┌────────────▼───────────┐  │
                        │  │   RAG Pipeline          │  │
                        │  │  ┌──────────────────┐   │  │
                        │  │  │ LangChain         │   │  │
                        │  │  │ + Embeddings      │   │  │
                        │  │  │ + LLM (Gemini)    │   │  │
                        │  │  └──────────────────┘   │  │
                        │  │  ┌──────────────────┐   │  │
                        │  │  │ ChromaDB          │   │  │
                        │  │  │ (Vector Store)    │   │  │
                        │  │  └──────────────────┘   │  │
                        │  │  ┌──────────────────┐   │  │
                        │  │  │ Google Drive API  │   │  │
                        │  │  │ (Doc Source)      │   │  │
                        │  │  └──────────────────┘   │  │
                        │  └─────────────────────────┘ │
                        └─────────────────────────────┘
```

> [!IMPORTANT]
> **Why a separate Python service?** The entire AI/ML ecosystem (LangChain, embeddings, vector DBs, PDF parsers) is Python-first. Trying to do RAG in Node.js would mean fewer library choices, worse documentation, and harder debugging. The Python service communicates with your Node.js backend via simple HTTP calls for auth validation.

---

## User Review Required

> [!IMPORTANT]
> **LLM Choice**: I'm planning to use **Google Gemini** (free tier available via `google-generativeai` API) as the LLM. Alternatives: OpenAI GPT (paid), Ollama (local, free but needs GPU). Which do you prefer?

> [!WARNING]
> **Google Drive Setup**: You'll need to create a Google Cloud project and enable the Drive API. I'll provide step-by-step instructions, but you'll need a Google account with access to the college's shared Drive folder.

> [!IMPORTANT]
> **Document Types**: What kinds of documents will be in the Drive? (PDFs, Word docs, spreadsheets, plain text?) This affects which document loaders we need.

---

## Proposed Changes

### Component 1: Python RAG Microservice

This is a **new standalone service** that runs alongside your Node.js backend.

#### [NEW] `chatbot/` — Root directory for the Python service

```
chatbot/
├── .env.example              # Template for environment variables
├── requirements.txt          # Python dependencies
├── main.py                   # FastAPI app entry point
├── config.py                 # Configuration & env loading
├── routers/
│   ├── chat.py               # Chat endpoints (/chat, /chat/stream)
│   └── documents.py          # Document search & download endpoints
├── services/
│   ├── rag_service.py        # Core RAG pipeline (embed → search → generate)
│   ├── vector_store.py       # ChromaDB initialization & operations
│   ├── document_loader.py    # Google Drive + file parsing logic
│   └── auth_service.py       # Validates JWT with Node.js backend
├── models/
│   ├── schemas.py            # Pydantic request/response models
│   └── chat_history.py       # In-memory chat session management
├── scripts/
│   └── ingest.py             # CLI script to manually ingest docs
└── data/
    └── chroma_db/            # Persistent vector store data (gitignored)
```

---

#### [NEW] [requirements.txt](file:///c:/Desktop/final_year_project/chatbot/requirements.txt)

Key dependencies:
| Package | Purpose |
|---|---|
| `fastapi` + `uvicorn` | Async Python web framework + ASGI server |
| `langchain` + `langchain-community` | RAG orchestration framework |
| `langchain-google-genai` | Google Gemini LLM integration |
| `chromadb` | Local vector database (no external server needed) |
| `sentence-transformers` | Free local embeddings (no API cost) |
| `google-api-python-client` + `google-auth` | Google Drive API access |
| `PyPDF2` / `python-docx` | PDF and Word document parsing |
| `python-jose` | JWT token verification (to validate existing tokens) |
| `httpx` | Async HTTP client |
| `python-dotenv` | Environment variable loading |

---

#### [NEW] [main.py](file:///c:/Desktop/final_year_project/chatbot/main.py)

FastAPI application with:
- CORS middleware (matching your Node.js config)
- Router mounting for `/api/chat` and `/api/documents`
- Startup event to initialize ChromaDB + load embeddings model
- Health check endpoint at `/health`

---

#### [NEW] [config.py](file:///c:/Desktop/final_year_project/chatbot/config.py)

Centralized configuration:
```python
# Key settings
GEMINI_API_KEY        # Google Gemini API key
GOOGLE_DRIVE_FOLDER_ID  # Root folder to ingest from
JWT_SECRET            # Same secret as Node.js backend (for token validation)
CHROMA_PERSIST_DIR    # Where vector DB is stored on disk
EMBEDDING_MODEL       # Default: "all-MiniLM-L6-v2" (free, runs locally)
CHUNK_SIZE            # Document chunk size (default: 1000 chars)
CHUNK_OVERLAP         # Overlap between chunks (default: 200 chars)
TOP_K_RESULTS         # Number of similar chunks to retrieve (default: 5)
```

---

#### [NEW] [services/rag_service.py](file:///c:/Desktop/final_year_project/chatbot/services/rag_service.py)

The **core brain** — this is where RAG happens:

```
User Query → Embed Query → Search ChromaDB → Get Top-K Chunks
    → Build Prompt with Context → Send to Gemini → Return Answer
```

Key features:
- **Custom prompt template** that includes:
  - Retrieved document chunks as context
  - User's role (student/faculty/admin) for role-aware answers
  - Instructions to cite sources
  - Instructions to suggest downloadable documents when relevant
- **Streaming support** for real-time response delivery
- **Source tracking** — every answer includes which documents were used

---

#### [NEW] [services/vector_store.py](file:///c:/Desktop/final_year_project/chatbot/services/vector_store.py)

ChromaDB management:
- Initialize/load persistent ChromaDB collection
- Add documents with metadata (filename, Drive URL, category, upload date)
- Similarity search with metadata filtering
- Delete/update documents when they change on Drive

> [!TIP]
> **Why ChromaDB?** It's a local vector DB — no external server, no cloud cost, runs on disk. Perfect for learning and handles 3,000 users easily. For production scale-up, you can swap to Pinecone or Weaviate later without changing the rest of the code (LangChain abstracts this).

---

#### [NEW] [services/document_loader.py](file:///c:/Desktop/final_year_project/chatbot/services/document_loader.py)

Google Drive integration:
1. **Authenticate** using a Google Service Account (no user login needed)
2. **List files** in configured Drive folder (recursively)
3. **Download & parse** supported file types:
   - PDF → `PyPDF2`
   - DOCX → `python-docx`
   - TXT/MD → Plain text
   - Google Docs → Export as text via Drive API
4. **Chunk documents** using LangChain's `RecursiveCharacterTextSplitter`
5. **Store metadata** — original filename, Drive file ID (for download links), category tags
6. **Incremental sync** — only re-ingest changed/new files (tracks modified timestamps)

---

#### [NEW] [services/auth_service.py](file:///c:/Desktop/final_year_project/chatbot/services/auth_service.py)

JWT validation that reuses your existing auth:
- Decode JWT using the same `JWT_SECRET` as your Node.js backend
- Extract `userId`, `role`, `userType` from token payload
- Middleware function for FastAPI routes
- No new login system — users use their existing ERP credentials

---

#### [NEW] [routers/chat.py](file:///c:/Desktop/final_year_project/chatbot/routers/chat.py)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message, get AI response with sources |
| `POST` | `/api/chat/stream` | Same but with SSE (Server-Sent Events) streaming |
| `GET` | `/api/chat/history` | Get chat history for current session |
| `DELETE` | `/api/chat/history` | Clear chat history |

Request body:
```json
{
  "message": "What documents do I need for a scholarship?",
  "session_id": "optional-session-uuid"
}
```

Response:
```json
{
  "answer": "For the merit scholarship, you need...",
  "sources": [
    { "filename": "Scholarship_Policy_2025.pdf", "page": 3, "drive_url": "..." }
  ],
  "downloadable_docs": [
    { "name": "Scholarship Application Form", "download_url": "/api/documents/download/abc123" }
  ]
}
```

---

#### [NEW] [routers/documents.py](file:///c:/Desktop/final_year_project/chatbot/routers/documents.py)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents/search?q=scholarship` | Search documents by keyword |
| `GET` | `/api/documents/download/{file_id}` | Download a file from Drive |
| `GET` | `/api/documents/list` | List all indexed document categories |
| `POST` | `/api/ingest/trigger` | Admin-only: trigger document re-ingestion |

---

#### [NEW] [models/schemas.py](file:///c:/Desktop/final_year_project/chatbot/models/schemas.py)

Pydantic models for request/response validation — type-safe API contracts.

---

#### [NEW] [models/chat_history.py](file:///c:/Desktop/final_year_project/chatbot/models/chat_history.py)

Simple in-memory chat history (per session):
- Stores last N messages per session (configurable, default 20)
- Auto-expires sessions after 30 minutes of inactivity
- Ready to swap to Redis for production (keeps interface the same)

---

### Component 2: Node.js Backend Changes

Minimal changes — just a proxy route so the frontend talks to one backend.

#### [MODIFY] [index.js](file:///c:/Desktop/final_year_project/backend/index.js)

Add a proxy middleware to forward `/chatbot/*` requests to the Python service:
```diff
+import { createProxyMiddleware } from 'http-proxy-middleware';
+
+// Proxy chatbot requests to Python RAG service
+app.use('/chatbot', createProxyMiddleware({
+  target: 'http://localhost:8000',
+  changeOrigin: true,
+  pathRewrite: { '^/chatbot': '/api' }
+}));
```

#### [MODIFY] [package.json](file:///c:/Desktop/final_year_project/backend/package.json)

Add `http-proxy-middleware` dependency.

---

### Component 3: Frontend Chat UI

A floating chat widget accessible from any page in the ERP.

#### [NEW] [ChatBot.tsx](file:///c:/Desktop/final_year_project/frontend/app/src/components/ChatBot/ChatBot.tsx)

Main floating chat widget:
- **Floating button** (bottom-right corner) with chat icon + unread badge
- **Chat panel** that slides up on click (like Intercom/Zendesk style)
- **Message bubbles** — user messages right-aligned, bot messages left-aligned
- **Markdown rendering** in bot responses (for formatted answers)
- **Source citations** shown as collapsible sections under answers
- **Download buttons** when the bot suggests documents
- **Typing indicator** animation while waiting for response
- **Session persistence** — chat history preserved during page navigation

#### [NEW] [ChatMessage.tsx](file:///c:/Desktop/final_year_project/frontend/app/src/components/ChatBot/ChatMessage.tsx)

Individual message component with:
- Avatar (user photo / bot icon)
- Markdown content rendering
- Timestamp
- Source documents list (collapsible)
- Download file buttons

#### [NEW] [ChatInput.tsx](file:///c:/Desktop/final_year_project/frontend/app/src/components/ChatBot/ChatInput.tsx)

Input area with:
- Text input with auto-resize
- Send button
- Loading state (disabled while waiting)

#### [NEW] [useChatBot.ts](file:///c:/Desktop/final_year_project/frontend/app/src/hooks/useChatBot.ts)

Custom React hook managing:
- Chat state (messages, loading, error)
- API calls to chatbot backend
- Streaming response handling (SSE)
- Session management
- Auth token inclusion in requests

#### [MODIFY] [App.tsx or Layout](file:///c:/Desktop/final_year_project/frontend/app/src/App.tsx)

Add `<ChatBot />` component to the main layout so it appears on all authenticated pages.

---

## How It All Works — Learning Guide

### 🧠 What is RAG?

```
Traditional LLM:
  User asks question → LLM answers from training data (may hallucinate)

RAG (Retrieval-Augmented Generation):
  User asks question → Search your documents first → Give LLM the relevant
  documents as context → LLM answers based on YOUR data (accurate!)
```

### 📚 The RAG Pipeline (Step by Step)

```
1. INGEST (one-time setup):
   Google Drive Files → Download → Split into chunks → 
   Convert to vectors (embeddings) → Store in ChromaDB

2. QUERY (every user question):
   User Question → Convert to vector → Find similar chunks in ChromaDB →
   Build prompt with chunks → Send to Gemini → Return answer + sources
```

### 🔑 Key Concepts You'll Learn

| Concept | What It Means | Where In Code |
|---|---|---|
| **Embeddings** | Converting text to numbers (vectors) for comparison | `vector_store.py` |
| **Vector Database** | A DB optimized for "find similar things" queries | `vector_store.py` (ChromaDB) |
| **Chunking** | Splitting long documents into small searchable pieces | `document_loader.py` |
| **Prompt Engineering** | Crafting instructions for the AI model | `rag_service.py` |
| **SSE Streaming** | Sending response word-by-word (like ChatGPT) | `chat.py` + `useChatBot.ts` |
| **Microservice** | A small independent service that does one job | The entire `chatbot/` folder |

---

## Scaling to 3,000 Users

### Phase 1: Working Prototype (what we build now)
- Single Python process with uvicorn
- ChromaDB on local disk
- In-memory chat history
- Handles ~50-100 concurrent users easily

### Phase 2: Production-Ready (future upgrades)
| Component | Current | Production |
|---|---|---|
| **Server** | Single uvicorn process | Gunicorn + multiple workers |
| **Chat History** | In-memory dict | Redis |
| **Vector DB** | Local ChromaDB | ChromaDB server mode or Pinecone |
| **Embeddings** | Local model (CPU) | GPU or API-based |
| **Caching** | None | Redis cache for frequent queries |
| **Rate Limiting** | None | FastAPI rate limiter |
| **Process Manager** | Manual | PM2 or Docker |

> [!TIP]
> The code is structured so each "Current" → "Production" upgrade is a **config change or swap**, not a rewrite. This is the benefit of using LangChain abstractions.

---

## Verification Plan

### Automated Tests

1. **Python service health check:**
```bash
cd chatbot
pip install -r requirements.txt
python main.py  # Should start on port 8000
curl http://localhost:8000/health  # Should return {"status": "ok"}
```

2. **Document ingestion test:**
```bash
# After configuring Google Drive credentials
python scripts/ingest.py --test  # Ingest 1-2 sample docs and verify ChromaDB has entries
```

3. **Chat API test:**
```bash
# After ingesting docs
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"message": "What is the scholarship policy?"}'
# Should return a JSON response with answer and sources
```

### Manual Verification

1. **Frontend chat widget**: 
   - Open the ERP in browser → verify floating chat button appears bottom-right
   - Click it → chat panel should slide up with a welcome message
   - Type a question → should see typing indicator, then an answer with sources
   - If answer mentions downloadable docs → download buttons should work

2. **Document download**:
   - Ask the chatbot "I need the scholarship application form"
   - Bot should respond with info + a download button
   - Clicking download should save the PDF to your computer

3. **Auth integration**:
   - Open chatbot without logging in → should show "Please log in" message
   - Log in as student → chatbot should work and know you're a student
   - Log in as admin → should have access to trigger re-ingestion

> [!NOTE]
> I'll walk you through setting up Google Drive API credentials step-by-step when we start building. You'll need to create a Google Cloud project (free).
