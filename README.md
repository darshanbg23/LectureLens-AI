<p align="center">
  <h1 align="center">LectureLens AI</h1>
  <p align="center">
    <strong>Search inside lecture videos using natural-language questions and receive answers with relevant lecture timestamps.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/python-3.10+-blue?logo=python&logoColor=white" alt="Python 3.10+">
    <img src="https://img.shields.io/badge/flask-web_ui-black?logo=flask&logoColor=white" alt="Flask">
    <img src="https://img.shields.io/badge/ollama-local_AI-blueviolet?logo=ollama&logoColor=white" alt="Ollama">
  </p>
</p>

## Project Overview

While watching a YouTube HTML course containing around 15 videos, I realized that finding a specific topic across the playlist could be time-consuming. Even when videos had separate titles and thumbnails, I still needed a way to ask a question and quickly find the relevant video and timestamp instead of manually searching through multiple videos.

This inspired me to build a **Retrieval-Augmented Learning Assistant** that allows users to ask questions about locally stored lecture videos and retrieve relevant content with source references and timestamps. Unlike a basic PDF-based RAG pipeline, this project focuses on building an end-to-end video-to-text retrieval system to understand how each stage of RAG works in practice.

The system uses **FFmpeg** for audio extraction, **Faster-Whisper** for transcription, **BGE-M3** for semantic embeddings, and **FAISS** for retrieving relevant lecture segments. The retrieved context is validated and passed to **Llama 3.2 via Ollama** to generate answers grounded in the available lecture content.

A key goal is to keep the core AI pipeline running locally, allowing users to search their offline video collections without sending lecture content to external AI services. The system is designed for locally stored educational videos, not just YouTube content. Future improvements include support for PDFs, PowerPoint presentations, Word documents, and other study materials, enabling users to search across multiple learning resources from one place.