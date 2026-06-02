import os
import subprocess

video_folder = "videos"
audio_folder = "audios"

if not os.path.exists(audio_folder):
    os.makedirs(audio_folder)

files = os.listdir(video_folder)

for file in files:

    if file.endswith(".mp4"):

        name = file.replace(".mp4", "") # Remove extension

        try:
            tutorial_number, title = name.split(" - ", 1) # sSlit number and title, Split only at first " - "
        except ValueError:
            print(f"Skipping invalid filename format: {file}")
            continue

        tutorial_number = str(int(tutorial_number)).zfill(2) # Convert to 01, 02, ...
        
        print(f"Processing: {tutorial_number} - {title}")

        input_path = os.path.join(video_folder, file)

        safe_title = title.replace(" ", "_") # Safer filename format

        output_path = os.path.join(audio_folder, f"{tutorial_number}_{safe_title}.mp3")

        subprocess.run([
            "ffmpeg",
            "-i",
            input_path,
            output_path
        ])
print("All videos converted successfully.")        