"""
Groq LLM integration for answer generation.
Uses llama-3.3-70b-versatile via the Groq API.
"""

import os
import httpx
from typing import Optional

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"

METHOD_DESCRIPTIONS = {
    "fixed": "Fixed-size chunking (split by token count with overlap)",
    "recursive": "Recursive character splitting (paragraph → sentence → word hierarchy)",
    "semantic": "Semantic chunking (grouped by sentence-level similarity)",
    "pageindex": "PageIndex (hierarchical tree index with LLM-guided navigation)",
}


async def _call_groq(messages: list, max_tokens: int = 512) -> str:
    if not GROQ_API_KEY:
        return "⚠️ GROQ_API_KEY not set. Add it to your .env file."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(GROQ_BASE_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def generate_answer(query: str, context: str, method: str) -> str:
    """
    Generate a RAG answer using the retrieved context.
    The system prompt explains which chunking strategy was used.
    """
    method_desc = METHOD_DESCRIPTIONS.get(method, method)
    system = f"""You are a precise RAG assistant. The user asked a question and you have been provided with retrieved context segments.
These segments were retrieved using: {method_desc}.

Instructions:
- Answer the question using ONLY the provided context.
- Be concise and factual (2-4 sentences).
- If the context is insufficient, say so clearly.
- Do NOT hallucinate or add information not in the context."""

    messages = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": f"Question: {query}\n\nRetrieved Context:\n{context}\n\nAnswer:",
        },
    ]

    return await _call_groq(messages, max_tokens=400)


async def generate_pageindex_summary(text: str) -> str:
    """
    Use Groq to generate a root-level summary for the PageIndex tree.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a document analyst. Generate a concise 1-sentence summary of the document that captures its main topic.",
        },
        {"role": "user", "content": f"Document:\n{text[:2000]}\n\nOne-sentence summary:"},
    ]
    return await _call_groq(messages, max_tokens=100)
