# Development on Arm dev machine

## Install Whisper.cpp

First, compile from the source code:

1. `git clone https://github.com/ggerganov/whisper.cpp.git`
1. `sudo apt update && sudo apt upgrade && sudo apt install make gcc g++`
1. `cd whisper.cpp`
1. `make`

Then, download models:

- `bash ./models/download-ggml-model.sh base-q5_1`
- ``

Test:

`./main -m /home/ubuntu/whisper.cpp/models/ggml-base-q5_1.bin -f samples/jfk.wav`

## Install edge-whisper-server systemd service

copy [edge-whisper-server.service](./edge-whisper-server.service) to `/etc/systemd/system/`.
Then, `mkdir -p /home/ubuntu/edge-whisper`, copy [whisper_server.py](./whisper_server.py) and [.env](./.env) to this directory.

Install `pip` and `ffmpeg`:

`sudo apt install python3-pip ffmpeg`

Install pip dependencies:

`pip install aiofiles uvicorn fastapi pydub openai-whisper python-multipart eyed3 scipy`

Start this systemd service to run the backend services:

1. `sudo systemctl enable edge-whisper-server`
1. `sudo systemctl start edge-whisper-server`

Or, you can run dev server by:

`ALLOW_ORIGIN=https://edge-ai.yomo.run WHISPERCPP_BIN=/home/ubuntu/whisper.cpp/main WHISPERCPP_MODEL=/home/ubuntu/whisper.cpp/models/ggml-base-q5_1.bin python whisper_server.py`

## Web App

Clone this repo and run `pnpm install && pnpm run dev`

## Notice

You have to change the CORS settings following your dev environment.
