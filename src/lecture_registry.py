import os
import json
import threading

REGISTRY_PATH = "data/lectures.json"

_lock = threading.Lock()
_lectures: list[dict] = []


def _sync_from_disk():
    courses_dir = "data/courses"
    if not os.path.isdir(courses_dir):
        return

    changed = False
    existing_by_key = {(l.get("course_id"), l.get("source_id")): l for l in _lectures if "source_id" in l}

    for course_id in os.listdir(courses_dir):
        lecs_dir = os.path.join(courses_dir, course_id, "lectures")
        if not os.path.isdir(lecs_dir):
            continue

        for source_id in os.listdir(lecs_dir):
            lec_path = os.path.join(lecs_dir, source_id)
            if not os.path.isdir(lec_path):
                continue

            has_video = os.path.isfile(os.path.join(lec_path, "video.mp4"))
            transcript_file = os.path.join(lec_path, "transcript.json")
            has_transcript = os.path.isfile(transcript_file)

            number = "01"
            title = source_id.replace("_", " ")
            if has_transcript:
                try:
                    with open(transcript_file, "r", encoding="utf-8") as f:
                        meta = json.load(f).get("metadata", {})
                        number = str(meta.get("number", number)).zfill(2)
                        title = meta.get("title", title)
                except Exception:
                    pass
            elif "_" in source_id:
                parts = source_id.split("_", 1)
                if parts[0].isdigit():
                    number = str(int(parts[0])).zfill(2)
                    title = parts[1].replace("_", " ")

            key = (course_id, source_id)
            if key in existing_by_key:
                entry = existing_by_key[key]
                if has_transcript and entry.get("status") != "ready":
                    entry["status"] = "ready"
                    entry["title"] = title
                    entry["number"] = number
                    changed = True
            else:
                status = "ready" if has_transcript else ("ready" if has_video else "uploading")
                new_entry = {
                    "source_id": source_id,
                    "course_id": course_id,
                    "number": number,
                    "title": title,
                    "file_type": "mp4",
                    "status": status,
                    "error": "",
                    "video_file": "video.mp4",
                    "audio_file": "audio.wav",
                    "transcript_file": "transcript.json",
                }
                _lectures.append(new_entry)
                existing_by_key[key] = new_entry
                changed = True

    if changed:
        _save()


def _load():
    global _lectures
    if os.path.isfile(REGISTRY_PATH):
        try:
            with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
                _lectures = json.load(f)
        except Exception:
            _lectures = []
    else:
        _lectures = []
    _sync_from_disk()


def _save():
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(_lectures, f, indent=2, ensure_ascii=False)


def get_all(course_id=None):
    with _lock:
        _sync_from_disk()
        if course_id:
            return [dict(l) for l in _lectures if l.get("course_id") == course_id]
        return list(_lectures)


def get(source_id):
    with _lock:
        for lec in _lectures:
            if lec["source_id"] == source_id:
                return dict(lec)
    return None


def next_number(course_id):
    with _lock:
        course_lectures = [l for l in _lectures if l.get("course_id") == course_id]
        if not course_lectures:
            return "01"

        max_num = 0
        for lec in course_lectures:
            try:
                num = int(lec["number"])
                if num > max_num:
                    max_num = num
            except (ValueError, KeyError):
                continue

        return str(max_num + 1).zfill(2)


def add(source_id, course_id, number, title, video_file, status="uploading"):
    with _lock:
        for lec in _lectures:
            if lec["source_id"] == source_id and lec.get("course_id") == course_id:
                lec["number"] = number
                lec["title"] = title
                lec["video_file"] = video_file
                lec["status"] = status
                lec["error"] = ""
                _save()
                return

        _lectures.append({
            "source_id": source_id,
            "course_id": course_id,
            "number": number,
            "title": title,
            "file_type": "mp4",
            "status": status,
            "error": "",
            "video_file": video_file,
            "audio_file": "audio.wav",
            "transcript_file": "transcript.json",
        })
        _save()


def update_status(source_id, status, error=""):
    with _lock:
        for lec in _lectures:
            if lec["source_id"] == source_id:
                lec["status"] = status
                lec["error"] = error
                _save()
                return


def remove(source_id):
    with _lock:
        global _lectures
        _lectures = [l for l in _lectures if l["source_id"] != source_id]
        _save()


def remove_by_course(course_id):
    with _lock:
        global _lectures
        _lectures = [l for l in _lectures if l.get("course_id") != course_id]
        _save()


def has_active_pipeline():
    with _lock:
        return any(
            lec["status"] in ("uploading", "processing", "indexing")
            for lec in _lectures
        )


def get_active():
    with _lock:
        for lec in _lectures:
            if lec["status"] in ("uploading", "processing", "indexing"):
                return dict(lec)
    return None


def is_cancelled(source_id):
    with _lock:
        for lec in _lectures:
            if lec["source_id"] == source_id:
                return lec["status"] == "cancelled"
    return True


def cancel(source_id):
    with _lock:
        for lec in _lectures:
            if lec["source_id"] == source_id:
                lec["status"] = "cancelled"
                lec["error"] = ""
                _save()
                return True
    return False


_load()
