# ChunkLens — Vector Chunking Strategy Explorer

A full-stack platform to visually explore and compare 4 RAG chunking strategies:
- **Fixed-size** — token-count splitting with overlap
- **Recursive** — hierarchical delimiter splitting
- **Semantic** — sentence-similarity based grouping
- **PageIndex** — hierarchical tree indexing (inspired by VectifyAI/PageIndex)

LLM answers powered by **Groq API** (llama-3.3-70b-versatile).

---

## Project Structure

```
chunklens/
├── backend/
│   ├── main.py          # FastAPI app, all endpoints
│   ├── chunkers.py      # 4 chunking strategy implementations
│   ├── retriever.py     # TF-IDF retrieval for each strategy
│   ├── llm.py           # Groq API integration
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── MethodCard.jsx
    │   │   ├── ChunkVisualizer.jsx
    │   │   ├── RetrievedResults.jsx
    │   │   └── TextInput.jsx
    │   ├── pages/
    │   │   ├── ExplainerPage.jsx
    │   │   ├── DemoPage.jsx
    │   │   └── ComparePage.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── constants.js
    │   └── styles/
    │       └── global.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup

### 1. Get a Groq API Key
Sign up at https://console.groq.com and create an API key.

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run the server
python main.py
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# App available at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chunk` | Chunk a document with a given strategy |
| POST | `/api/retrieve` | Retrieve + generate LLM answer |
| POST | `/api/compare` | Run all 4 methods in parallel |

### Request body for `/api/retrieve`
```json
{
  "text": "Your document text...",
  "query": "What is RAG?",
  "method": "semantic",
  "chunk_size": 80,
  "overlap": 15,
  "top_k": 3
}
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Explainer | `/` | Interactive guide to each strategy with live chunking |
| Live Demo | `/demo` | Upload doc, ask question, get Groq-powered answer |
| Compare All | `/compare` | Run all 4 strategies simultaneously, side-by-side |

---

## Extending

- **Real embeddings**: Replace TF-IDF in `retriever.py` with `sentence-transformers` for true semantic search
- **Vector DB**: Swap in Pinecone, Qdrant, or Chroma for production-scale retrieval
- **PDF upload**: Add `pypdf` or `pdfplumber` to backend for PDF parsing
- **Real PageIndex**: Integrate the actual [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) library
- **Auth**: Add API key auth via FastAPI dependencies
