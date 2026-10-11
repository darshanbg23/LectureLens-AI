import subprocess
import sys
import os

COURSES_DIR = "data/courses"

PIPELINE_STEPS = [
    ("pipeline/video_to_audio.py", "Converting videos to audio"),
    ("pipeline/audio_to_json.py", "Transcribing audio to JSON"),
    ("pipeline/chunk_to_embeddings.py", "Generating embeddings"),
]

def run_step(script, description):
    print(f"\n{'=' * 60}")
    print(f"  Step: {description}")
    print(f"  Script: {script}")
    print(f"{'=' * 60}\n")
    result = subprocess.run([sys.executable, script])
    if result.returncode != 0:
        print(f"\nError: '{script}' failed with exit code {result.returncode}.")
        sys.exit(1)

def main():
    print("\nLectureLens AI - Preprocessing Pipeline\n")
    if not os.path.isdir(COURSES_DIR):
        print(f"Error: '{COURSES_DIR}/' directory not found.")
        sys.exit(1)
        
    videos = []
    for c in os.listdir(COURSES_DIR):
        lecs_dir = os.path.join(COURSES_DIR, c, "lectures")
        if os.path.isdir(lecs_dir):
            for l in os.listdir(lecs_dir):
                if os.path.exists(os.path.join(lecs_dir, l, "video.mp4")):
                    videos.append(f"{c}/lectures/{l}")
                    
    if not videos:
        print(f"Error: No video.mp4 files found in any course.")
        sys.exit(1)
        
    print(f"Found {len(videos)} video(s):")
    for v in sorted(videos):
        print(f"  - {v}")
        
    for script, description in PIPELINE_STEPS:
        run_step(script, description)
        
    print(f"\n{'=' * 60}")
    print("  Preprocessing complete!")
    print(f"{'=' * 60}\n")

if __name__ == "__main__":
    main()
