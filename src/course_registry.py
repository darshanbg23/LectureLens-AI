import os
import json
import threading
import uuid

COURSES_DIR = "data/courses"

_lock = threading.Lock()
_courses: list[dict] = []


def _load():
    global _courses
    _courses = []
    if os.path.isdir(COURSES_DIR):
        for course_id in os.listdir(COURSES_DIR):
            course_file = os.path.join(COURSES_DIR, course_id, "course.json")
            if os.path.isfile(course_file):
                try:
                    with open(course_file, "r", encoding="utf-8") as f:
                        _courses.append(json.load(f))
                except Exception:
                    pass


def _save_course(course):
    course_dir = os.path.join(COURSES_DIR, course["course_id"])
    os.makedirs(course_dir, exist_ok=True)
    course_file = os.path.join(course_dir, "course.json")
    with open(course_file, "w", encoding="utf-8") as f:
        json.dump(course, f, indent=2, ensure_ascii=False)


def get_all():
    with _lock:
        return list(_courses)


def get(course_id):
    with _lock:
        for course in _courses:
            if course["course_id"] == course_id:
                return dict(course)
    return None


def add(name, instructor):
    course_id = str(uuid.uuid4())
    course = {
        "course_id": course_id,
        "name": name,
        "instructor": instructor
    }
    with _lock:
        _courses.append(course)
        _save_course(course)
    return course_id


def remove(course_id):
    with _lock:
        global _courses
        _courses = [c for c in _courses if c["course_id"] != course_id]


_load()
