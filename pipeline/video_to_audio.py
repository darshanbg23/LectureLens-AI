import os
import subprocess

COURSES_DIR = "data/courses"


def main():
    if not os.path.isdir(COURSES_DIR):
        return

    for c in os.listdir(COURSES_DIR):
        lecs_dir = os.path.join(COURSES_DIR, c, "lectures")
        if not os.path.isdir(lecs_dir):
            continue

        for l in os.listdir(lecs_dir):
            lec_path = os.path.join(lecs_dir, l)
            video_path = os.path.join(lec_path, "video.mp4")
            audio_path = os.path.join(lec_path, "audio.wav")

            if os.path.exists(video_path) and not os.path.exists(audio_path):
                print(f"Extracting audio for {l}...")
                subprocess.run(
                    ["ffmpeg", "-i", video_path, "-y", audio_path],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.PIPE
                )

    print("All videos converted successfully.")


if __name__ == "__main__":
    main()