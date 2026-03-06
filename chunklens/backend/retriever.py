"""
Retrieval logic for each chunking strategy.
Uses TF-IDF style scoring (no vector DB needed — all in-memory).
PageIndex uses tree-navigation style scoring per node.
"""

import re
import math
from typing import List, Dict, Any


def _tokenize(text: str) -> List[str]:
    return re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())


def _tf(tokens: List[str]) -> Dict[str, float]:
    freq: Dict[str, int] = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    total = len(tokens) or 1
    return {k: v / total for k, v in freq.items()}


def _idf(query_tokens: List[str], corpus: List[List[str]]) -> Dict[str, float]:
    N = len(corpus)
    result = {}
    for term in set(query_tokens):
        df = sum(1 for doc in corpus if term in doc)
        result[term] = math.log((N + 1) / (df + 1)) + 1
    return result


def _tfidf_score(query_tokens: List[str], doc_tokens: List[str], idf: Dict[str, float]) -> float:
    tf = _tf(doc_tokens)
    score = 0.0
    for term in query_tokens:
        score += tf.get(term, 0.0) * idf.get(term, 0.0)
    return round(score, 4)


def retrieve_chunks(
    chunks: List[Dict], query: str, top_k: int = 3
) -> List[Dict]:
    """
    Score each chunk against the query using TF-IDF and return top_k.
    """
    query_tokens = _tokenize(query)
    corpus = [_tokenize(c["content"]) for c in chunks]
    idf = _idf(query_tokens, corpus)

    scored = []
    for i, chunk in enumerate(chunks):
        doc_tokens = corpus[i]
        score = _tfidf_score(query_tokens, doc_tokens, idf)
        scored.append({
            **chunk,
            "score": score,
            "rank": 0,
            "matched_terms": [t for t in set(query_tokens) if t in doc_tokens],
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[:top_k]
    for i, item in enumerate(top):
        item["rank"] = i + 1

    return top


def retrieve_pageindex(tree: Dict, query: str, top_k: int = 3) -> List[Dict]:
    """
    Navigate the PageIndex tree: score each section node by
    keyword overlap AND structural position (section ordering).
    Simulates how an LLM would navigate the index.
    """
    query_tokens = _tokenize(query)
    children = tree["children"]
    corpus = [_tokenize(c["content"]) for c in children]
    idf = _idf(query_tokens, corpus)

    scored = []
    for i, node in enumerate(children):
        doc_tokens = corpus[i]
        base_score = _tfidf_score(query_tokens, doc_tokens, idf)

        # Keyword overlap bonus
        keyword_overlap = len(set(query_tokens) & set(node.get("keywords", [])))
        keyword_bonus = keyword_overlap * 0.05

        final_score = round(base_score + keyword_bonus, 4)

        scored.append({
            **node,
            "score": final_score,
            "rank": 0,
            "matched_terms": [t for t in set(query_tokens) if t in doc_tokens],
            "keyword_bonus": keyword_bonus,
            "navigation_path": f"Root → {node['title']}",
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[:top_k]
    for i, item in enumerate(top):
        item["rank"] = i + 1

    return top
