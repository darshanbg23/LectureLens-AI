from faster_whisper import WhisperModel
import os
import json

# Uncomment the line below to enable GPU acceleration (CUDA required).
# model = WhisperModel("large-v2", device="cuda", compute_type="float16")

# Using CPU mode by default for compatibility, since not all systems have access to a CUDA-capable GPU.
model = WhisperModel("large-v2", device="cpu", compute_type="int8")

audio_folder = "audios"
json_folder = "jsons"

if not os.path.exists(json_folder):
    os.makedirs(json_folder)

audios = os.listdir(audio_folder)

for audio in audios:

    if not audio.endswith(".mp3"):
        continue

    name = audio.replace(".mp3", "")

    if "_" not in name:
        print(f"Skipping invalid file: {name}")
        continue

    number, title = name.split("_", 1)

    print(f"Processing: {number} - {title}...")

    try:
        audio_path = os.path.join(audio_folder, audio)

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

        with open(os.path.join(json_folder, f"{name}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Error processing {audio}: {e}")

print("All files processed successfully.")