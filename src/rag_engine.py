import os
import requests
import json
import numpy as np
import faiss
import re


OLLAMA_URL = "http://localhost:11434"
EMBED_URL = f"{OLLAMA_URL}/api/embed"
GENERATE_URL = f"{OLLAMA_URL}/api/generate"

EMBED_MODEL = "bge-m3"
LLM_MODEL = "llama3.2"

TOP_K = 5
SIMILARITY_THRESHOLD = 0.40
KEYWORD_WEIGHT = 0.3
SEMANTIC_WEIGHT = 0.7
MERGE_GAP_SECONDS = 5
HIGH_CONFIDENCE_THRESHOLD = 0.55

FAISS_INDEX_PATH = "index/faiss_index.bin"
METADATA_PATH = "index/metadata.json"

faiss_index = None
metadata = []


def _load_index():
    global faiss_index, metadata

    if os.path.isfile(FAISS_INDEX_PATH) and os.path.isfile(METADATA_PATH):
        try:
            new_index = faiss.read_index(FAISS_INDEX_PATH)
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                new_metadata = json.load(f)

            faiss_index = new_index
            metadata = new_metadata if isinstance(new_metadata, list) else []
            return True
        except Exception:
            faiss_index = None
            metadata = []
            return False
    else:
        faiss_index = None
        metadata = []
        return False


_load_index()


def reload_index():
    return _load_index()

def create_embedding(text):

    try:
        r = requests.post(
            EMBED_URL,
            json={
                "model": EMBED_MODEL,
                "input": [text]
            }
        )

        r.raise_for_status()

        return r.json()["embeddings"][0]

    except requests.exceptions.RequestException:
        raise Exception("Failed to connect to Ollama.")

def generate_answer(prompt):

    try:
        r = requests.post(
            GENERATE_URL,
            json={
                "model": LLM_MODEL,
                "prompt": prompt,
                "stream": False
            }
        )

        r.raise_for_status()

        return r.json()["response"].strip()

    except requests.exceptions.RequestException:
        raise Exception("Failed to generate response.")

def format_time(sec):

    return f"{int(sec//60):02}:{int(sec%60):02}"

STOP_WORDS = {
    "what", "where", "when", "which", "who", "why", "how",
    "is", "are", "was", "were", "be", "been", "being",
    "the", "a", "an",
    "and", "or", "but", "nor", "so", "yet",
    "to", "of", "in", "on", "for", "about", "with", "at", "by", "from", "as", "into", "like", "through",
    "this", "that", "these", "those", "it", "its",
    "teach", "taught",
    "do", "does", "did",
    "can", "could", "should", "would",
    "tell", "explain", "describe", "define",
    "introduce", "introduced", "introduces",
    "cover", "covered", "covers",
    "mention", "mentioned", "mentions",
    "show", "shows", "shown",
    "discuss", "discussed", "discusses",
    "use", "used", "using",
    "work", "works",
    "find", "found",
    "create", "created",
    "make", "made",
    "learn", "learning"
}

DOMAIN_SYNONYMS = {
    "anchor": ["a", "tag", "tags", "hyperlink", "hyperlinks", "href", "link", "links"],
    "hyperlink": ["link", "links", "a", "tag", "tags", "anchor", "href"],
    "heading": ["header", "headers", "headings", "h1", "h2", "h3", "h4", "h5", "h6"],
    "header": ["heading", "headings", "h1", "h2", "h3", "h4", "h5", "h6"],
    "image": ["img", "picture", "pictures", "src"],
    "picture": ["image", "images", "img"],
    "paragraph": ["p", "paragraphs"],
    "bold": ["strong", "b"],
    "italic": ["em", "emphasis", "i"],
    "underline": ["ins", "u"],
    "list": ["lists", "ul", "ol", "li", "unordered", "ordered"],
    "table": ["tables", "tr", "td", "th"],
    "button": ["buttons", "click"],
    "comment": ["comments", "notes"],
    "break": ["br", "line break"],
    "meta": ["metadata", "metatag", "metatags"]
}


def extract_keywords(query):
    q_norm = re.sub(r"\b([a-zA-Z0-9]+)\.js\b", r"\1js", query.lower())
    words = re.findall(r"[a-zA-Z0-9]+", q_norm)

    return [
        word
        for word in words
        if word not in STOP_WORDS and len(word) > 1
    ]


def detect_intent(query):

    query = query.lower().strip()

    if query.startswith(("where", "which lecture", "which video")):
        return "location"

    elif query.startswith(("has", "have", "did", "does", "is", "are")):
        return "yes_no"

    elif query.startswith(("what", "define", "explain")):
        return "definition"

    elif query.startswith(("summarize", "summary")):
        return "summary"

    return "general"


def keyword_score(text, keywords):

    if not keywords:
        return 0.0

    text_lower = text.lower()
    matched = 0

    for keyword in keywords:
        if keyword in text_lower:
            matched += 1

    return matched / len(keywords)


def match_keyword_semantically(keyword, context_lower):

    if keyword in context_lower:
        return True

    if keyword in DOMAIN_SYNONYMS:
        for syn in DOMAIN_SYNONYMS[keyword]:
            if len(syn) <= 2:
                if re.search(r"\b" + re.escape(syn) + r"\b", context_lower) or f"<{syn}>" in context_lower or f"{syn} tag" in context_lower:
                    return True
            else:
                if syn in context_lower:
                    return True

    return False


def validate_context(context_text, keywords, max_semantic_score):

    if not keywords:
        return True

    if max_semantic_score >= HIGH_CONFIDENCE_THRESHOLD:
        return True

    context_lower = context_text.lower()

    matched = 0

    for keyword in keywords:
        if match_keyword_semantically(keyword, context_lower):
            matched += 1

    score = matched / len(keywords)

    if len(keywords) == 1:
        return matched == 1

    return score >= 0.4


def retrieve_chunks(query_embedding, keywords):

    if faiss_index is None or not metadata or getattr(faiss_index, "ntotal", 0) == 0:
        return None, 0.0

    query_vec = np.array([query_embedding], dtype=np.float32)
    search_k = min(TOP_K, faiss_index.ntotal)
    if search_k <= 0:
        return None, 0.0

    semantic_scores, indices = faiss_index.search(query_vec, search_k)

    semantic_scores = semantic_scores[0]
    indices = indices[0]

    valid_mask = (indices >= 0) & (indices < len(metadata))
    semantic_scores = semantic_scores[valid_mask]
    indices = indices[valid_mask]

    if len(indices) == 0:
        return None, 0.0

    max_semantic = float(semantic_scores[0])

    if max_semantic < SIMILARITY_THRESHOLD:
        return None, 0.0

    kw_scores = np.array([
        keyword_score(metadata[idx]["text"], keywords)
        for idx in indices
    ])

    hybrid_scores = (SEMANTIC_WEIGHT * semantic_scores) + (KEYWORD_WEIGHT * kw_scores)

    results = []
    for i, idx in enumerate(indices):
        chunk = metadata[idx]
        results.append({
            "chunk_id": chunk["chunk_id"],
            "source_id": chunk.get("source_id", ""),
            "number": chunk["number"],
            "title": chunk["title"],
            "start": chunk["start"],
            "end": chunk["end"],
            "text": chunk["text"],
            "score": float(hybrid_scores[i]),
            "semantic_score": float(semantic_scores[i])
        })

    import pandas as pd
    results = pd.DataFrame(results)

    max_hybrid = results["score"].max()

    results = results[
        results["score"] >= max_hybrid - 0.10
    ]

    results = results.sort_values(by=["number", "start"])

    return results, max_semantic


def merge_neighbouring_chunks(results):

    if results is None or len(results) <= 1:
        return results

    rows = results.to_dict("records")
    merged = [rows[0]]

    for row in rows[1:]:
        prev = merged[-1]

        same_lecture = prev["number"] == row["number"]
        close_enough = row["start"] - prev["end"] <= MERGE_GAP_SECONDS

        if same_lecture and close_enough:
            prev["end"] = max(prev["end"], row["end"])
            prev["text"] = prev["text"].rstrip() + " " + row["text"].lstrip()
            prev["score"] = max(prev["score"], row["score"])
            prev["semantic_score"] = max(prev["semantic_score"], row["semantic_score"])
        else:
            merged.append(row)

    import pandas as pd
    return pd.DataFrame(merged)


def select_best_lecture(results, score_margin=0.05):

    if results is None or len(results) == 0:
        return results

    top_score = results["score"].max()

    valid_lectures = []
    for lecture_num, group in results.groupby("number"):
        if group["score"].max() >= (top_score - score_margin):
            valid_lectures.append(lecture_num)

    return results[results["number"].isin(valid_lectures)]


def build_context(results):

    context = []
    multi_lecture = results["number"].nunique() > 1

    for _, row in results.iterrows():
        start_str = format_time(row["start"])
        end_str = format_time(row["end"])

        if multi_lecture:
            header = f"[Lecture {row['number']} - \"{row['title']}\" | {start_str} - {end_str}]"
        else:
            header = f"[{start_str} - {end_str}]"

        context.append(f"{header}\n\n{row['text']}\n")

    return "\n\n".join(context)


def build_prompt(lecture_number, lecture_title, combined_time, context, query, intent="general"):

    return f"""SYSTEM / INSTRUCTION:
You are a teaching assistant answering questions about course material.

Your ONLY source of information is the lecture content provided below.
Answer using ONLY the lecture content provided below and the source metadata.

Rules:
1. Answer the student's question directly, concisely, and factually.
2. Never use any outside knowledge, prior training data, or assumptions, and do NOT guess, infer, or supplement with outside knowledge. Never invent unsupported facts.
3. Do NOT repeat the question and do not rephrase the student's question before answering.
4. Do NOT greet the student (e.g., no "Hello", "Hi", "Hey") and do not use conversational filler (such as "Sure!", "Of course!", "Certainly!", "To answer your question...", "Hope you're doing well").
5. Keep answers concise and clear.
6. When the question asks where, which lecture, or when something was taught, use the supplied lecture metadata and timestamps. The lecture number and title in the metadata identify which lecture the course content belongs to; do not reject an answer simply because the lecture number is not spoken aloud in the text.
7. Do not claim that a topic is taught in a particular lecture unless the supplied lecture content supports that claim.
8. When multiple lectures are present in the context, refer to the relevant lecture and timestamp for that specific topic instead of assuming everything belongs to one lecture.
9. Do NOT mention "the transcript" or "the text", and do not mention internal implementation details such as embeddings, FAISS, retrieval, or context validation. Speak as a helpful teaching assistant.
10. If the lecture content does not contain enough information to answer the question, reply EXACTLY with:
This topic is not covered in this lecture.

SOURCE METADATA:
Lecture: {lecture_number} "{lecture_title}"
Timestamp: {combined_time}

Lecture Content:
{context}

Student Question:
{query}
"""

def get_answer(query):

    if faiss_index is None or not metadata or getattr(faiss_index, "ntotal", 0) == 0:
        return "This topic is not covered in this lecture.", []

    query_embedding = create_embedding(query)
    query_embedding = np.array(query_embedding, dtype=np.float32)
    query_embedding = query_embedding / np.linalg.norm(query_embedding)

    keywords = extract_keywords(query)

    results, max_semantic = retrieve_chunks(query_embedding, keywords)

    if results is None:
        return "This topic is not covered in this lecture.", []

    intent = detect_intent(query)

    results = merge_neighbouring_chunks(results)

    results = select_best_lecture(results)

    retrieved_text = " ".join(results["text"].tolist())

    if not validate_context(retrieved_text, keywords, max_semantic):
        return "This topic is not covered in this lecture.", []

    context = build_context(results)

    unique_lecs = results[["number", "title"]].drop_duplicates()

    if len(unique_lecs) == 1:
        lecture_number = results.iloc[0]["number"]
        lecture_title = results.iloc[0]["title"]
        start_time = format_time(results["start"].min())
        end_time = format_time(results["end"].max())
        combined_time = f"{start_time}-{end_time}"
    else:
        lecture_number = ", ".join(unique_lecs["number"].tolist())
        lecture_title = " / ".join(unique_lecs["title"].tolist())
        time_parts = [
            f"Lecture {num}: {format_time(grp['start'].min())}-{format_time(grp['end'].max())}"
            for num, grp in results.groupby("number")
        ]
        combined_time = "; ".join(time_parts)

    prompt = build_prompt(
        lecture_number,
        lecture_title,
        combined_time,
        context,
        query,
        intent
    )

    answer = generate_answer(prompt)
    
    sources = []
    for _, row in results.iterrows():
        sources.append({
            "source_id": row.get("source_id", ""),
            "title": row.get("title", ""),
            "number": row.get("number", ""),
            "start": float(row.get("start", 0.0)),
            "end": float(row.get("end", 0.0)),
            "text": row.get("text", "")
        })

    return answer, sources


if __name__ == "__main__":

    while True:

        query = input("\nAsk a question (or type 'exit'): ")

        if query.lower() == "exit":
            break

        print()
        print(get_answer(query))
