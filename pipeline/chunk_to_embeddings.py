import os
import json
import requests
import numpy as np
import faiss

COURSES_DIR = "data/courses"
FAISS_INDEX_PATH = "index/faiss_index.bin"
METADATA_PATH = "index/metadata.json"
OLLAMA_EMBED_URL = "http://localhost:11434/api/embed"
EMBED_MODEL = "bge-m3"

def create_embeddings(texts):
    r = requests.post(
        OLLAMA_EMBED_URL,
        json={"model": EMBED_MODEL, "input": texts}
    )
    r.raise_for_status()
    return r.json()["embeddings"]

def main():
    os.makedirs("index", exist_ok=True)
        
    all_metadata = []
    all_embeddings = []
    chunk_id = 0
    
    if not os.path.isdir(COURSES_DIR):
        print("No courses directory.")
        return
        
    for c in os.listdir(COURSES_DIR):
        lecs_dir = os.path.join(COURSES_DIR, c, "lectures")
        if not os.path.isdir(lecs_dir):
            continue
            
        for l in os.listdir(lecs_dir):
            lec_path = os.path.join(lecs_dir, l)
            json_path = os.path.join(lec_path, "transcript.json")
            
            if os.path.exists(json_path):
                print(f"Embedding {l}...")
                with open(json_path, encoding="utf-8") as f:
                    content = json.load(f)
                    
                texts = []
                valid_chunks = []
                for chunk in content.get("chunks", []):
                    text = chunk["english_text"].strip()
                    if text:
                        texts.append(text)
                        valid_chunks.append(chunk)
                        
                if not texts:
                    continue
                    
                embeddings = create_embeddings(texts)
                meta = content["metadata"]
                
                for i, chunk in enumerate(valid_chunks):
                    if embeddings[i] is None:
                        continue
                    all_metadata.append({
                        "chunk_id": chunk_id,
                        "source_id": l,
                        "number": meta["number"],
                        "title": meta["title"],
                        "start": chunk["start"],
                        "end": chunk["end"],
                        "text": chunk["english_text"]
                    })
                    all_embeddings.append(embeddings[i])
                    chunk_id += 1

    if len(all_embeddings) == 0:
        print("No embeddings generated.")
        return
        
    emb_matrix = np.array(all_embeddings, dtype=np.float32)
    norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
    norms = np.maximum(norms, 1e-12)
    emb_matrix = emb_matrix / norms
    
    dimension = emb_matrix.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(emb_matrix)
    
    faiss.write_index(index, FAISS_INDEX_PATH)
    
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)
        
    print(f"\nFAISS index saved to '{FAISS_INDEX_PATH}'")
    print(f"Metadata saved to '{METADATA_PATH}'")
    print(f"Total embedded chunks: {index.ntotal}")

if __name__ == "__main__":
    main()
