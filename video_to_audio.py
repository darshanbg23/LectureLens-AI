import os

video_folder = "videos"
audio_folder = "audios"

if not os.path.exists(audio_folder):
    os.makedirs(audio_folder)

files = os.listdir(video_folder)