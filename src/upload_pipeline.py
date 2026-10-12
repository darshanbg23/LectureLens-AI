import os
import re
import subprocess
import json
import numpy as np
import faiss
import requests
from faster_whisper import WhisperModel
from src import lecture_registry as registry

FAISS_INDEX_PATH = "index/faiss_index.bin"
METADATA_PATH = "index/metadata.json"
OLLAMA_EMBED_URL = "http://localhost:11434/api/embed"
EMBED_MODEL = "bge-m3"

_whisper_model = None

def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = WhisperModel("large-v2", device="cpu", compute_type="int8")
    return _whisper_model

def get_lecture_dir(course_id, source_id):
    return os.path.join("data", "courses", course_id, "lectures", source_id)

def validate_video(file, course_id):
    if file is None or file.filename == "":
        return False, "No file selected."
    filename = file.filename
    if not filename.lower().endswith(".mp4"):
        return False, "Only .mp4 files are accepted."
    
    lectures = registry.get_all(course_id)
    number, title = parse_filename(filename, course_id)
    safe_title = title.replace(" ", "_")
    cand_id = f"{number}_{safe_title}"
    prefixed_cand_id = f"{course_id[:8]}_{cand_id}"
    for lec in lectures:
        lec_sid = lec.get("source_id")
        if lec_sid in (cand_id, prefixed_cand_id):
            return False, "This lecture video has already been uploaded."
    return True, None

def parse_filename(filename, course_id):
    name = re.sub(r'\.mp4$', '', filename, flags=re.IGNORECASE)
    if " - " in name:
        number_part, title = name.split(" - ", 1)
        try:
            number_str = str(int(number_part)).zfill(2)
            return number_str, title
        except ValueError:
            pass
    m = re.match(r'^(\d+)[_\s-]+(.*)$', name)
    if m:
        try:
            number_str = str(int(m.group(1))).zfill(2)
            title = m.group(2).replace("_", " ").strip()
            if title:
                return number_str, title
        except ValueError:
            pass
    title = name.replace("_", " ").strip()
    if not title:
        title = "Untitled Lecture"
    number_str = registry.next_number(course_id)
    return number_str, title

def extract_audio(course_id, source_id, video_filename):
    lec_dir = get_lecture_dir(course_id, source_id)
    os.makedirs(lec_dir, exist_ok=True)
    audio_filename = "audio.wav"
    input_path = os.path.join(lec_dir, video_filename)
    output_path = os.path.join(lec_dir, audio_filename)

    result = subprocess.run(
        ["ffmpeg", "-i", input_path, "-y", output_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )
    if result.returncode != 0:
        error_msg = result.stderr.decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"ffmpeg failed: {error_msg}")
    return audio_filename

def transcribe_audio(course_id, source_id, title, number):
    lec_dir = get_lecture_dir(course_id, source_id)
    model = _get_whisper_model()
    audio_path = os.path.join(lec_dir, "audio.wav")

    segments, info = model.transcribe(audio_path, task="translate")
    chunks = []
    full_text = ""
    temp_text = ""
    chunk_start = None
    chunk_end = None

    for segment in segments:
        if chunk_start is None:
            chunk_start = segment.start
        temp_text += segment.text + " "
        chunk_end = segment.end
        if chunk_end - chunk_start >= 30:
            chunks.append({
                "number": number,
                "title": title,
                "start": chunk_start,
                "end": chunk_end,
                "english_text": temp_text.strip()
            })
            full_text += temp_text + " "
            temp_text = ""
            chunk_start = None
            chunk_end = None

    if temp_text:
        chunks.append({
            "number": number,
            "title": title,
            "start": chunk_start,
            "end": chunk_end,
            "english_text": temp_text.strip()
        })
        full_text += temp_text

    data = {
        "metadata": {
            "number": number,
            "title": title,
            "duration": info.duration,
            "language": info.language
        },
        "chunks": chunks,
        "full_text": full_text.strip()
    }
    
    json_path = os.path.join(lec_dir, "transcript.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    chunks_path = os.path.join(lec_dir, "chunks.json")
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    return "transcript.json"

def _create_embeddings(texts):
    r = requests.post(
        OLLAMA_EMBED_URL,
        json={"model": EMBED_MODEL, "input": texts}
    )
    r.raise_for_status()
    return r.json()["embeddings"]

def _get_embedding_dimension():
    try:
        sample = _create_embeddings(["test"])
        if sample and len(sample) > 0 and sample[0] is not None:
            return len(sample[0])
    except Exception:
        pass
    return 1024

def rebuild_index():
    os.makedirs("index", exist_ok=True)
    all_metadata = []
    all_embeddings = []
    chunk_id = 0
    
    courses_dir = os.path.join("data", "courses")
    found_transcripts = False
    
    if os.path.exists(courses_dir):
        for course_id in os.listdir(courses_dir):
            lecs_dir = os.path.join(courses_dir, course_id, "lectures")
            if not os.path.exists(lecs_dir):
                continue
            for source_id in os.listdir(lecs_dir):
                json_path = os.path.join(lecs_dir, source_id, "transcript.json")
                if not os.path.exists(json_path):
                    continue
                    
                found_transcripts = True
                with open(json_path, encoding="utf-8") as f:
                    content = json.load(f)

                texts = []
                valid_chunks = []
                for c in content["chunks"]:
                    text = c["english_text"].strip()
                    if text:
                        texts.append(text)
                        valid_chunks.append(c)

                if not texts:
                    continue

                embeddings = _create_embeddings(texts)
                meta = content["metadata"]

                for i, chunk in enumerate(valid_chunks):
                    if embeddings[i] is None:
                        continue
                    all_metadata.append({
                        "chunk_id": chunk_id,
                        "source_id": source_id,
                        "number": meta["number"],
                        "title": meta["title"],
                        "start": chunk["start"],
                        "end": chunk["end"],
                        "text": chunk["english_text"]
                    })
                    all_embeddings.append(embeddings[i])
                    chunk_id += 1

    if not found_transcripts or len(all_embeddings) == 0:
        dimension = _get_embedding_dimension()
        empty_index = faiss.IndexFlatIP(dimension)
        faiss.write_index(empty_index, FAISS_INDEX_PATH)
        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump([], f)
        return 0, 0

    emb_matrix = np.array(all_embeddings, dtype=np.float32)
    norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
    emb_matrix = emb_matrix / norms
    dimension = emb_matrix.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(emb_matrix)

    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)

    return len(all_metadata), index.ntotal

def delete_lecture(course_id, source_id):
    lec_dir = get_lecture_dir(course_id, source_id)
    if os.path.exists(lec_dir):
        import shutil
        shutil.rmtree(lec_dir)
    rebuild_index()
