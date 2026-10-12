import os
import json
import threading
import uuid
import datetime

REGISTRY_PATH = "data/chats.json"

_lock = threading.Lock()
_chats: list[dict] = []


def _load():
    global _chats
    if os.path.isfile(REGISTRY_PATH):
        try:
            with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
                _chats = json.load(f)
        except Exception:
            _chats = []
    else:
        _chats = []


def _save():
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(_chats, f, indent=2, ensure_ascii=False)


def create_chat(title="New Conversation", course_id=None):
    chat_id = str(uuid.uuid4())
    now = datetime.datetime.now().isoformat()
    with _lock:
        _chats.append({
            "chat_id": chat_id,
            "course_id": course_id,
            "title": title,
            "created_at": now,
            "updated_at": now,
            "messages": []
        })
        _save()
    return chat_id


def add_message(chat_id, role, text, sources=None):
    now = datetime.datetime.now().isoformat()
    with _lock:
        for chat in _chats:
            if chat["chat_id"] == chat_id:
                if role == "user" and (chat.get("title") in ("New Chat", "New Conversation", "") or not chat.get("title")):
                    chat["title"] = text[:45].strip() + ("..." if len(text) > 45 else "")
                msg = {
                    "role": role,
                    "text": text,
                    "timestamp": now
                }
                if sources is not None:
                    msg["sources"] = sources
                chat["messages"].append(msg)
                chat["updated_at"] = now
                _save()
                return True
    return False


def get_chat(chat_id):
    with _lock:
        for chat in _chats:
            if chat["chat_id"] == chat_id:
                return dict(chat)
    return None


def get_all(course_id=None):
    with _lock:
        if course_id:
            return [dict(c) for c in _chats if c.get("course_id") == course_id]
        return [dict(c) for c in _chats]


def remove(chat_id):
    with _lock:
        global _chats
        _chats = [c for c in _chats if c["chat_id"] != chat_id]
        _save()


_load()
