import os
import threading
from flask import Flask, render_template, request, jsonify, send_file
from src.rag_engine import get_answer, reload_index
from src.upload_pipeline import (
    validate_video, parse_filename,
    extract_audio, transcribe_audio, rebuild_index,
    delete_lecture, get_lecture_dir
)
from src import lecture_registry as registry
from src import course_registry
from src import chat_registry
import json

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024

def _run_pipeline(course_id, source_id, video_filename, number, title):
    try:
        registry.update_status(source_id, "processing")
        if registry.is_cancelled(source_id):
            return

        audio_filename = extract_audio(course_id, source_id, video_filename)
        if registry.is_cancelled(source_id):
            return

        transcribe_audio(course_id, source_id, title, number)
        if registry.is_cancelled(source_id):
            return

        registry.update_status(source_id, "indexing")
        if registry.is_cancelled(source_id):
            return

        rebuild_index()
        reload_index()

        if registry.is_cancelled(source_id):
            _run_cleanup(course_id, source_id)
            return

        registry.update_status(source_id, "ready")

    except Exception as e:
        if registry.is_cancelled(source_id):
            return
        registry.update_status(source_id, "failed", error=str(e))
        try:
            lec_dir = get_lecture_dir(course_id, source_id)
            video_path = os.path.join(lec_dir, video_filename)
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass


def _run_cleanup(course_id, source_id):
    try:
        delete_lecture(course_id, source_id)
        reload_index()
    except Exception:
        pass
    finally:
        registry.remove(source_id)


def _run_delete(course_id, source_id):
    try:
        delete_lecture(course_id, source_id)
        reload_index()
        registry.remove(source_id)
    except Exception as e:
        registry.update_status(source_id, "failed", error=f"Delete failed: {str(e)}")

@app.route("/")
def index():
    return render_template("home.html")

@app.route("/workspace/<course_id>")
def workspace(course_id):
    return render_template("index.html", course_id=course_id)


@app.route("/lectures/<source_id>/video")
def serve_video(source_id):
    lec = registry.get(source_id)
    if not lec:
        return "Not found", 404
    course_id = lec.get("course_id")
    if not course_id:
        return "No course associated", 404
    video_file = lec.get("video_file", "video.mp4")
    video_path = os.path.join(get_lecture_dir(course_id, source_id), video_file)
    if not os.path.isfile(video_path):
        return "Video not found", 404
    return send_file(video_path, mimetype="video/mp4")


@app.route("/courses", methods=["GET"])
def get_courses():
    courses = course_registry.get_all()
    return jsonify({"success": True, "courses": courses})


@app.route("/courses", methods=["POST"])
def create_course():
    data = request.get_json(silent=True)
    if not data or not data.get("name", "").strip() or not data.get("instructor", "").strip():
        return jsonify({"success": False, "error": "Name and instructor are required."}), 400
    
    course_id = course_registry.add(data["name"].strip(), data["instructor"].strip())
    return jsonify({"success": True, "course_id": course_id})


@app.route("/courses/<course_id>", methods=["DELETE"])
def delete_course(course_id):
    course = course_registry.get(course_id)
    if not course:
        return jsonify({"success": False, "error": "Course not found."}), 404

    try:
        registry.remove_by_course(course_id)

        import shutil
        course_dir = os.path.join("data", "courses", course_id)
        if os.path.isdir(course_dir):
            shutil.rmtree(course_dir)

        from src.upload_pipeline import rebuild_index
        rebuild_index()
        reload_index()

        course_registry.remove(course_id)

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to delete course: {str(e)}"}), 500


@app.route("/chats", methods=["GET"])
def get_chats():
    course_id = request.args.get("course_id")
    chats = chat_registry.get_all(course_id=course_id)
    return jsonify({"success": True, "chats": chats})


@app.route("/chats", methods=["POST"])
def create_chat():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "New Conversation")
    course_id = data.get("course_id")
    chat_id = chat_registry.create_chat(title=title, course_id=course_id)
    chat = chat_registry.get_chat(chat_id)
    return jsonify({"success": True, "chat_id": chat_id, "chat": chat})


@app.route("/chats/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    chat = chat_registry.get_chat(chat_id)
    if not chat:
        return jsonify({"success": False, "error": "Chat not found"}), 404
    return jsonify({"success": True, "chat": chat})


@app.route("/chats/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    chat_registry.remove(chat_id)
    return jsonify({"success": True})


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True)
    if not data or not data.get("question", "").strip():
        return jsonify({"error": "Please enter a question.", "success": False}), 400

    question = data["question"].strip()
    chat_id = data.get("chat_id", None)
    course_id = data.get("course_id", None)

    if not chat_id:
        title = question[:40] + "..." if len(question) > 40 else question
        chat_id = chat_registry.create_chat(title=title, course_id=course_id)

    chat_registry.add_message(chat_id, "user", question)

    try:
        answer, sources = get_answer(question)
        chat_registry.add_message(chat_id, "assistant", answer, sources=sources)
        return jsonify({"success": True, "chat_id": chat_id, "answer": answer, "sources": sources})
    except Exception as e:
        error_msg = str(e)
        if "connect" in error_msg.lower() or "connection" in error_msg.lower():
            error_msg = "Could not connect to Ollama. Please make sure Ollama is running on localhost:11434."
        return jsonify({"error": error_msg, "success": False}), 500


@app.route("/upload", methods=["POST"])
def upload():
    if registry.has_active_pipeline():
        return jsonify({"error": "An upload is already in progress. Please wait.", "success": False}), 409

    if "video" not in request.files:
        return jsonify({"error": "No video file provided.", "success": False}), 400

    course_id = request.form.get("course_id")
    if not course_id:
        return jsonify({"error": "Course ID is required.", "success": False}), 400

    file = request.files["video"]

    is_valid, error_msg = validate_video(file, course_id)
    if not is_valid:
        return jsonify({"error": error_msg, "success": False}), 400

    number, title = parse_filename(file.filename, course_id)
    safe_title = title.replace(" ", "_")
    base_source_id = f"{number}_{safe_title}"

    source_id = base_source_id
    existing = registry.get(source_id)
    if existing and existing.get("course_id") != course_id:
        source_id = f"{course_id[:8]}_{base_source_id}"

    lec_dir = get_lecture_dir(course_id, source_id)
    os.makedirs(lec_dir, exist_ok=True)
    video_path = os.path.join(lec_dir, "video.mp4")

    try:
        file.save(video_path)
    except Exception as e:
        return jsonify({"error": f"Failed to save video: {str(e)}", "success": False}), 500

    registry.add(source_id, course_id, number, title, "video.mp4", status="uploading")

    thread = threading.Thread(
        target=_run_pipeline,
        args=(course_id, source_id, "video.mp4", number, title),
        daemon=True
    )
    thread.start()

    return jsonify({"success": True, "source_id": source_id, "lecture_number": number, "lecture_title": title})


@app.route("/upload/status", methods=["GET"])
def upload_status():
    active = registry.get_active()
    if active:
        return jsonify({
            "success": True,
            "status": active["status"],
            "source_id": active["source_id"],
            "filename": active.get("video_file", ""),
            "lecture_number": active["number"],
            "lecture_title": active["title"],
            "error": active["error"]
        })

    return jsonify({
        "success": True,
        "status": "idle",
        "source_id": "",
        "filename": "",
        "lecture_number": "",
        "lecture_title": "",
        "error": ""
    })


@app.route("/lectures", methods=["GET"])
def lectures():
    try:
        course_id = request.args.get("course_id")
        all_lectures = registry.get_all(course_id)

        lecture_list = []
        for lec in all_lectures:
            if lec["status"] == "cancelled":
                continue

            lecture_list.append({
                "source_id": lec["source_id"],
                "number": lec["number"],
                "title": lec["title"],
                "file_type": lec["file_type"],
                "status": lec["status"],
                "error": lec["error"],
            })

        return jsonify({"lectures": lecture_list, "success": True})

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/lectures/<source_id>/transcript", methods=["GET"])
def get_transcript(source_id):
    lec = registry.get(source_id)
    if not lec:
        return jsonify({"success": False, "error": "Lecture not found."}), 404
        
    course_id = lec.get("course_id")
    if not course_id:
        return jsonify({"success": False, "error": "Lecture has no course."}), 404
    
    transcript_path = os.path.join(get_lecture_dir(course_id, source_id), "transcript.json")
    if not os.path.exists(transcript_path):
        return jsonify({"success": False, "error": "Transcript file missing."}), 404
        
    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_data = json.load(f)
        return jsonify({"success": True, "transcript": transcript_data})
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to load transcript: {str(e)}"}), 500


@app.route("/lectures/<source_id>/cancel", methods=["POST"])
def cancel_lecture(source_id):
    lec = registry.get(source_id)
    if not lec:
        return jsonify({"error": "Lecture not found.", "success": False}), 404

    if lec["status"] not in ("uploading", "processing", "indexing"):
        return jsonify({"error": "Lecture is not currently processing.", "success": False}), 400

    registry.cancel(source_id)
    course_id = lec.get("course_id")

    thread = threading.Thread(
        target=_run_cleanup,
        args=(course_id, source_id),
        daemon=True
    )
    thread.start()

    return jsonify({"success": True})


@app.route("/lectures/<source_id>", methods=["DELETE"])
def delete_lecture_route(source_id):
    lec = registry.get(source_id)
    if not lec:
        return jsonify({"error": "Lecture not found.", "success": False}), 404

    course_id = lec.get("course_id")

    if lec["status"] in ("uploading", "processing", "indexing"):
        registry.cancel(source_id)
        thread = threading.Thread(
            target=_run_cleanup,
            args=(course_id, source_id),
            daemon=True
        )
        thread.start()
        return jsonify({"success": True})

    if lec["status"] == "deleting":
        return jsonify({"error": "Lecture is already being deleted.", "success": False}), 409

    registry.update_status(source_id, "deleting")

    thread = threading.Thread(
        target=_run_delete,
        args=(course_id, source_id),
        daemon=True
    )
    thread.start()

    return jsonify({"success": True})


@app.route("/lectures/<source_id>/retry", methods=["POST"])
def retry_lecture(source_id):
    lec = registry.get(source_id)
    if not lec:
        return jsonify({"error": "Lecture not found.", "success": False}), 404

    if lec["status"] != "failed":
        return jsonify({"error": "Only failed lectures can be retried.", "success": False}), 400

    if registry.has_active_pipeline():
        return jsonify({"error": "Another upload is in progress. Please wait.", "success": False}), 409

    course_id = lec.get("course_id")
    video_file = lec.get("video_file", "")
    video_path = os.path.join(get_lecture_dir(course_id, source_id), video_file)
    
    if not video_file or not os.path.isfile(video_path):
        return jsonify({"error": "Video file not found. Please re-upload.", "success": False}), 400

    registry.update_status(source_id, "uploading", error="")

    thread = threading.Thread(
        target=_run_pipeline,
        args=(course_id, source_id, video_file, lec["number"], lec["title"]),
        daemon=True
    )
    thread.start()

    return jsonify({"success": True})


@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File is too large. Maximum upload size is 500 MB.", "success": False}), 413


if __name__ == "__main__":
    print("\n  LectureLens AI is running at http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)