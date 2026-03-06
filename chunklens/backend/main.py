from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from chunkers import chunk_fixed, chunk_recursive, chunk_semantic, build_page_index
from retriever import retrieve_chunks, retrieve_pageindex
from llm import generate_answer, generate_pageindex_summary

app = FastAPI(title="ChunkLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChunkRequest(BaseModel):
    text: str
    method: str  # fixed | recursive | semantic | pageindex
    chunk_size: Optional[int] = 300
    overlap: Optional[int] = 50


class QueryRequest(BaseModel):
    text: str
    query: str
    method: str
    chunk_size: Optional[int] = 300
    overlap: Optional[int] = 50
    top_k: Optional[int] = 3


@app.get("/")
def root():
    return {"status": "ChunkLens API running"}


@app.post("/api/chunk")
def chunk_document(req: ChunkRequest):
    """Chunk a document using the specified method."""
    try:
        if req.method == "fixed":
            chunks = chunk_fixed(req.text, req.chunk_size, req.overlap)
            return {"method": "fixed", "chunks": chunks, "count": len(chunks)}

        elif req.method == "recursive":
            chunks = chunk_recursive(req.text, req.chunk_size)
            return {"method": "recursive", "chunks": chunks, "count": len(chunks)}

        elif req.method == "semantic":
            chunks = chunk_semantic(req.text)
            return {"method": "semantic", "chunks": chunks, "count": len(chunks)}

        elif req.method == "pageindex":
            tree = build_page_index(req.text)
            return {"method": "pageindex", "tree": tree, "count": len(tree["children"])}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown method: {req.method}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/retrieve")
async def retrieve(req: QueryRequest):
    """Retrieve relevant chunks and generate an LLM answer."""
    try:
        if req.method == "pageindex":
            tree = build_page_index(req.text)
            retrieved = retrieve_pageindex(tree, req.query, req.top_k)
            context = "\n\n".join([r["content"] for r in retrieved])
        else:
            if req.method == "fixed":
                chunks = chunk_fixed(req.text, req.chunk_size, req.overlap)
            elif req.method == "recursive":
                chunks = chunk_recursive(req.text, req.chunk_size)
            elif req.method == "semantic":
                chunks = chunk_semantic(req.text)
            else:
                raise HTTPException(status_code=400, detail=f"Unknown method: {req.method}")

            retrieved = retrieve_chunks(chunks, req.query, req.top_k)
            context = "\n\n".join([r["content"] for r in retrieved])

        answer = await generate_answer(req.query, context, req.method)

        return {
            "method": req.method,
            "query": req.query,
            "retrieved": retrieved,
            "answer": answer,
            "context_length": len(context),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/compare")
async def compare_all(req: QueryRequest):
    """Run all 4 methods and return results for side-by-side comparison."""
    results = {}
    methods = ["fixed", "recursive", "semantic", "pageindex"]

    for method in methods:
        try:
            req.method = method
            result = await retrieve(req)
            results[method] = result
        except Exception as e:
            results[method] = {"error": str(e)}

    return {"query": req.query, "results": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
