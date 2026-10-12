# Application Backend Modules

This directory contains the core backend modules for LectureLens AI. These modules handle course and lecture management, video processing, transcription, vector indexing, chat history, and retrieval-augmented question answering.

## Modules

### `course_registry.py`

Manages course records stored at `data/courses/<course_id>/course.json`.

- Generates unique course identifiers and saves course metadata, including the course name and instructor.
- Loads existing courses from disk on startup and provides thread-safe access to course records.
- Key functions: `add()`, `get()`, `get_all()`, and `remove()`.

### `lecture_registry.py`

Tracks lecture metadata and processing status across courses. Records are stored in `data/lectures.json` and synchronized with lecture directories under `data/courses/<course_id>/lectures/<source_id>/`.

- Tracks lecture lifecycle states: `uploading`, `processing`, `indexing`, `ready`, `failed`, and `cancelled`.
- Identifies lectures using the `(course_id, source_id)` combination to prevent conflicts between courses.
- Generates sequential two-digit lecture numbers, such as `01` and `02`, for each course.
- Key functions: `add()`, `get()`, `get_all()`, `next_number()`, `update_status()`, `remove()`, `remove_by_course()`, `has_active_pipeline()`, `get_active()`, `cancel()`, and `is_cancelled()`.

### `chat_registry.py`

Stores conversation history and source citations in `data/chats.json`.

- Persists chat sessions associated with specific courses.
- Records user and assistant messages along with source references.
- Generates conversation titles from the initial user message.
- Key functions: `create_chat()`, `add_message()`, `get_chat()`, `get_all()`, and `remove()`.

### `upload_pipeline.py`

Processes uploaded lecture videos into transcripts, text chunks, and vector embeddings.

- Validates MP4 uploads and extracts lecture titles and numbers from filenames.
- Uses FFmpeg to extract audio into `audio.wav`.
- Uses Faster-Whisper (`large-v2`) to transcribe audio and create approximately 30-second text chunks.
- Saves transcription results as `transcript.json` and `chunks.json`.
- Generates vector embeddings for transcript chunks using the Ollama `bge-m3` model.
- Builds and saves the FAISS index at `index/faiss_index.bin` and its associated metadata at `index/metadata.json`.
- Deletes lecture files and rebuilds the index when lectures are removed.
- Key functions: `validate_video()`, `parse_filename()`, `extract_audio()`, `transcribe_audio()`, `rebuild_index()`, and `delete_lecture()`.

### `rag_engine.py`

Implements the retrieval and answer-generation engine for student questions.

- Loads the FAISS index and associated metadata into memory.
- Performs semantic retrieval using FAISS inner-product search on normalized embeddings, combined with keyword scoring and domain synonym expansion.
- Merges adjacent chunks from the same lecture and filters low-relevance results.
- Sends retrieved lecture context to Ollama using the `llama3.2` model to generate answers with source citations.
- Provides `reload_index()` to refresh the in-memory index when the indexed data changes.
- Key functions: `get_answer()`, `reload_index()`, `retrieve_chunks()`, `merge_neighbouring_chunks()`, and `select_best_lecture()`.

### `__init__.py`

Marks `src` as a Python package.

## Component Interactions

```text
app.py
  ├── course_registry.py
  │     └── Creates and retrieves course records
  ├── lecture_registry.py
  │     └── Tracks lecture metadata and processing status
  ├── upload_pipeline.py
  │     ├── Extracts audio and generates transcripts
  │     ├── Generates embeddings using Ollama
  │     └── Builds the FAISS index and metadata
  ├── rag_engine.py
  │     ├── Retrieves relevant lecture chunks
  │     └── Generates answers using Ollama
  └── chat_registry.py
        └── Stores conversation history and source citations
```

## Video Ingestion Flow

1. `app.py` receives a lecture video and validates it using `upload_pipeline.validate_video()`.
2. The upload pipeline extracts audio using FFmpeg and transcribes it using Faster-Whisper.
3. The pipeline divides the transcript into chunks, generates embeddings using `bge-m3`, and updates the FAISS index and metadata.
4. `rag_engine.reload_index()` refreshes the in-memory index after indexing is complete.
5. `lecture_registry.update_status()` tracks the lecture's processing status so the frontend can display progress.

## Question Answering Flow

1. `app.py` receives a student's question and passes it to `rag_engine.get_answer()`.
2. The RAG engine generates a query embedding using Ollama and retrieves relevant chunks through FAISS search and keyword matching.
3. Relevant chunks are combined where appropriate and included in a prompt sent to Ollama's `llama3.2` model.
4. The generated answer and source references are returned to `app.py`.
5. `chat_registry.py` stores the conversation messages and citation metadata.

## External Services and Dependencies

- **FFmpeg:** Extracts WAV audio from MP4 lecture videos.
- **Faster-Whisper:** Transcribes lecture audio using the `large-v2` model.
- **Ollama:** Runs local embedding and language models at `http://localhost:11434`.
  - `bge-m3`: Generates embeddings for lecture chunks and student queries.
  - `llama3.2`: Generates answers using retrieved lecture context.
- **FAISS (`faiss-cpu`):** Performs vector similarity search using inner-product scores on normalized embeddings.