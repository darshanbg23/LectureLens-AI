<p align="center">
  <h1 align="center">LectureLens AI</h1>
  <p align="center">
    <strong>Search inside lecture videos using natural language and get answers with exact timestamps.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/python-3.10+-blue?logo=python&logoColor=white" alt="Python 3.10+">
    <img src="https://img.shields.io/badge/flask-web_ui-black?logo=flask&logoColor=white" alt="Flask">
    <img src="https://img.shields.io/badge/ollama-local_AI-blueviolet?logo=ollama&logoColor=white" alt="Ollama">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </p>
</p>

---

LectureLens AI lets you ask questions about your lecture videos and get direct answers that point you to the right lecture and timestamp. Instead of scrubbing through hours of recordings to find where a topic was explained, you type a question and the system finds the relevant section for you.

Under the hood, it uses Retrieval-Augmented Generation (RAG) to transcribe lectures, build a searchable index, and generate answers grounded in the actual transcript. Everything runs locally on your machine using open-source models through [Ollama](https://ollama.com/) -- no cloud APIs, no data leaving your computer.

