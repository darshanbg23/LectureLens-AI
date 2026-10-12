# Processing Pipeline

This directory contains scripts that process lecture videos into searchable vector embeddings for LectureLens AI.

## Workflow

```
flowchart LR
    A[Video] --> B[Audio]
    B --> C[Transcript and Chunks]
    C --> D[Embeddings]
    D --> E[FAISS Index]
```

When a user opens the web application and creates a new course, the application stores the course and its uploaded lecture videos under `data/courses/`. Each course is identified by a unique `course_id`, and each lecture is organized using its `lecture_id`.

The pipeline processes these stored lecture videos to generate transcripts, embeddings, and a searchable FAISS index.

## Scripts

### 1. `video_to_audio.py`

Extracts audio from lecture videos using FFmpeg.

- **Input:** `video.mp4` from `data/courses/<course_id>/lectures/<lecture_id>/`.
- **Output:** `audio.wav` saved in the same data course lecture directory.

### 2. `audio_to_json.py`

Transcribes lecture audio using Faster-Whisper and groups the recognized text into approximately 30-second chunks.

- **Input:** `audio.wav` from each data course lecture directory.
- **Output:** The following files are saved in the corresponding data course lecture directory:
  - `transcript.json`: Transcript text, metadata, and timestamps.
  - `chunks.json`: Text chunks with timestamps.

### 3. `chunk_to_embeddings.py`

Generates vector embeddings for transcript chunks using BGE-M3 through Ollama, normalizes the vectors, and builds a FAISS index.

- **Input:** `transcript.json` files from the lecture directories associated with their respective `course_id` and `lecture_id`.
- **Output:**
  - `index/faiss_index.bin`: FAISS vector index.
  - `index/metadata.json`: Metadata associated with the indexed chunks, including their course and lecture references.

### 4. `run_pipeline.py`

Automates the complete workflow by executing `video_to_audio.py`, `audio_to_json.py`, and `chunk_to_embeddings.py` in sequence.

- **Input:** Lecture videos stored under `data/courses/<course_id>/lectures/<lecture_id>/`.
- **Output:** Extracted audio, transcript files, chunks, and the FAISS index.

## Running the Pipeline

Ensure FFmpeg is installed and Ollama is running with the `bge-m3` model available.

Run the following command from the project root:

```bash
python pipeline/run_pipeline.py
```