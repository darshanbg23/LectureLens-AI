import requests
import os
import json
import pandas as pd
import joblib

# Generate embeddings using Ollama
def create_embeddings(texts):
    r = requests.post(
        "http://localhost:11434/api/embed",
        json={"model": "bge-m3", "input": texts}
    )
    return r.json()["embeddings"]

jsons = os.listdir("jsons")

all_chunks = []
chunk_id = 0

for file in jsons:

    if not file.endswith(".json"):
        continue

    with open(f"jsons/{file}", encoding="utf-8") as f:
        content = json.load(f)

    print(f"Processing: {file}")

    texts = []
    valid_chunks = []

    # Collect valid chunk texts for embedding
    for c in content["chunks"]:
        text = c["english_text"].strip()
        if text:
            texts.append(text)
            valid_chunks.append(c)

    embeddings = create_embeddings(texts)

    meta = content["metadata"]

    # Combine metadata with embeddings
    for i, chunk in enumerate(valid_chunks):

        if embeddings[i] is None:
            continue

        all_chunks.append({
            "chunk_id": chunk_id,
            "number": meta["number"],
            "title": meta["title"],
            "start": chunk["start"],
            "end": chunk["end"],
            "text": chunk["english_text"],
            "embedding": embeddings[i]
        })

        chunk_id += 1

# Convert to DataFrame
df = pd.DataFrame(all_chunks)

# Save embeddings for retrieval
joblib.dump(df, "embeddings.joblib")

print("Embeddings saved successfully!.")