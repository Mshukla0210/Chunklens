"""
All 4 chunking strategies:
1. Fixed-size chunking
2. Recursive character splitting
3. Semantic chunking (sentence-boundary + similarity heuristic)
4. PageIndex (hierarchical tree indexing)
"""

import re
from typing import List, Dict, Any


# ─── 1. FIXED-SIZE CHUNKING ───────────────────────────────────────────────────

def chunk_fixed(text: str, chunk_size: int = 300, overlap: int = 50) -> List[Dict]:
    """
    Splits text by word count into chunks of `chunk_size` words,
    with `overlap` words carried over to maintain context at boundaries.
    """
    words = text.split()
    chunks = []
    i = 0
    chunk_id = 0

    while i < len(words):
        end = min(i + chunk_size, len(words))
        chunk_words = words[i:end]
        chunk_text = " ".join(chunk_words)

        chunks.append({
            "id": chunk_id,
            "content": chunk_text,
            "word_count": len(chunk_words),
            "char_count": len(chunk_text),
            "start_word": i,
            "end_word": end,
            "method": "fixed",
        })

        chunk_id += 1
        i += chunk_size - overlap

    return chunks


# ─── 2. RECURSIVE CHARACTER SPLITTING ─────────────────────────────────────────

def chunk_recursive(text: str, max_words: int = 300) -> List[Dict]:
    """
    Tries to split on paragraph boundaries first, then sentence boundaries,
    then word boundaries — recursively until all chunks are within max_words.
    """
    SEPARATORS = ["\n\n\n", "\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "]

    def split_text(text: str, separators: List[str]) -> List[str]:
        if not separators:
            # Last resort: split by words
            words = text.split()
            result = []
            for i in range(0, len(words), max_words):
                result.append(" ".join(words[i:i + max_words]))
            return result

        sep = separators[0]
        parts = text.split(sep)
        chunks = []
        current = ""

        for part in parts:
            candidate = (current + sep + part).strip() if current else part.strip()
            if len(candidate.split()) <= max_words:
                current = candidate
            else:
                if current:
                    chunks.append(current.strip())
                if len(part.split()) > max_words:
                    # Recursively split this part with next separators
                    sub = split_text(part, separators[1:])
                    chunks.extend(sub)
                    current = ""
                else:
                    current = part.strip()

        if current:
            chunks.append(current.strip())

        return [c for c in chunks if c.strip()]

    raw_chunks = split_text(text, SEPARATORS)

    return [
        {
            "id": i,
            "content": chunk,
            "word_count": len(chunk.split()),
            "char_count": len(chunk),
            "method": "recursive",
            "separator_level": _infer_separator(chunk),
        }
        for i, chunk in enumerate(raw_chunks)
    ]


def _infer_separator(chunk: str) -> str:
    if "\n" in chunk:
        return "paragraph"
    if re.search(r"[.!?]", chunk):
        return "sentence"
    return "word"


# ─── 3. SEMANTIC CHUNKING ─────────────────────────────────────────────────────

def chunk_semantic(text: str, threshold: float = 0.35) -> List[Dict]:
    """
    Splits text into sentences, then groups sentences together as long as
    they share enough vocabulary (Jaccard similarity) with adjacent sentences.
    When similarity drops below threshold, a new chunk begins.
    """
    sentences = _split_sentences(text)
    if not sentences:
        return []

    groups = []
    current_group = [sentences[0]]

    for i in range(1, len(sentences)):
        sim = _jaccard_similarity(sentences[i - 1], sentences[i])
        if sim >= threshold:
            current_group.append(sentences[i])
        else:
            groups.append(current_group)
            current_group = [sentences[i]]

    if current_group:
        groups.append(current_group)

    chunks = []
    for i, group in enumerate(groups):
        content = " ".join(group)
        # Compute average similarity within group
        sims = []
        for j in range(1, len(group)):
            sims.append(_jaccard_similarity(group[j - 1], group[j]))
        avg_sim = sum(sims) / len(sims) if sims else 1.0

        chunks.append({
            "id": i,
            "content": content,
            "word_count": len(content.split()),
            "char_count": len(content),
            "sentence_count": len(group),
            "avg_similarity": round(avg_sim, 3),
            "method": "semantic",
        })

    return chunks


def _split_sentences(text: str) -> List[str]:
    # Split on sentence-ending punctuation
    raw = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in raw if s.strip() and len(s.split()) > 2]


def _jaccard_similarity(a: str, b: str) -> float:
    def tokens(s):
        return set(w.lower() for w in re.findall(r"\b\w{4,}\b", s))
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


# ─── 4. PAGEINDEX ─────────────────────────────────────────────────────────────

def build_page_index(text: str) -> Dict[str, Any]:
    """
    Builds a hierarchical tree index from the document.
    Sections are identified by paragraph boundaries (double newlines).
    Each section gets a topic label derived from its first sentence.
    The root node holds a global summary stub (filled by LLM in real use).
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    children = []
    for i, para in enumerate(paragraphs):
        sentences = _split_sentences(para)
        topic = sentences[0][:80] + "..." if sentences else para[:80] + "..."
        keywords = _extract_keywords(para, top_n=6)

        children.append({
            "id": i,
            "title": f"Section {i + 1}",
            "topic": topic,
            "content": para,
            "word_count": len(para.split()),
            "char_count": len(para),
            "sentence_count": len(sentences),
            "keywords": keywords,
            "level": 1,
            "method": "pageindex",
        })

    return {
        "root": {
            "title": "Document Root",
            "summary": "Hierarchical index of the full document.",
        },
        "children": children,
        "total_sections": len(children),
        "total_words": len(text.split()),
    }


def _extract_keywords(text: str, top_n: int = 6) -> List[str]:
    # Simple frequency-based keyword extraction
    stopwords = {
        "the", "and", "for", "that", "this", "with", "from", "are", "has",
        "have", "been", "they", "their", "which", "when", "into", "also",
        "more", "than", "such", "these", "those", "its", "not", "but", "can",
        "all", "any", "each", "used", "use", "using", "may", "will", "was",
    }
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    freq: Dict[str, int] = {}
    for w in words:
        if w not in stopwords:
            freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in sorted_words[:top_n]]
