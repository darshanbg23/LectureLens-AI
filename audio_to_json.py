import os

audio_folder = "audios"
json_folder = "jsons"

if not os.path.exists(json_folder):
    os.makedirs(json_folder)