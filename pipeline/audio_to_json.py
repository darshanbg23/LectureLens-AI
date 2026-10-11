from faster_whisper import WhisperModel
import os
import json

COURSES_DIR = "data/courses"


def main():
    model = WhisperModel("large-v2", device="cpu", compute_type="int8")

    if not os.path.isdir(COURSES_DIR):
        return

    for c in os.listdir(COURSES_DIR):
        lecs_dir = os.path.join(COURSES_DIR, c, "lectures")
        if not os.path.isdir(lecs_dir):
            continue

        for l in os.listdir(lecs_dir):
            lec_path = os.path.join(lecs_dir, l)
            audio_path = os.path.join(lec_path, "audio.wav")
            json_path = os.path.join(lec_path, "transcript.json")
            chunks_path = os.path.join(lec_path, "chunks.json")

            if os.path.exists(audio_path) and not os.path.exists(json_path):
                print(f"Processing: {l}...")

                number = l.split('_')[0] if '_' in l else "00"
                title = l.split('_', 1)[1] if '_' in l else l

                try:
                    segments, info = model.transcribe(audio_path, task="translate")
                    chunks = []
                    full_text = ""
                    temp_text = ""
                    chunk_start = None
                    chunk_end = None

                    for segment in segments:
                        if chunk_start is None: chunk_start = segment.start
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

                    with open(json_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    with open(chunks_path, "w", encoding="utf-8") as f:
                        json.dump(chunks, f, indent=2, ensure_ascii=False)

                except Exception as e:
                    print(f"Error processing {l}: {e}")

    print("All files processed successfully.")


if __name__ == "__main__":
    main()