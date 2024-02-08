### zihan@yomo.run 2023-12-02
### Whisper mode running on NVidia T4
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pyAudioAnalysis.audioBasicIO import read_audio_file
from pydub.silence import split_on_silence
from pydub import AudioSegment
from whisper import load_model, transcribe
# import asyncio
import os
import threading
import uuid
import aiofiles
import traceback

app = FastAPI()

# declare the list of origins that should be allowed to make requests to the server
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://edge-ai.yomo.run",
]

# config the CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的源
    allow_credentials=True,  # 支持 cookie
    allow_methods=["*"],  # 允许使用的请求方法
    allow_headers=["*"]  # 允许携带的 Headers
)

# load the whisper model
model = load_model("large-v3", device="cuda")  # 选择 medium 模型

lock = threading.Lock()

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_file_path = None
    try:
        print(file)

        # create a temp file to store the uploaded file
        temp_file_path = f"temp_{uuid.uuid4().hex}.ogg"
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            while content := await file.read(1024*30):
                await out_file.write(content)

        # silence detection and removing
        rate, audio = read_audio_file(temp_file_path)
        aud = AudioSegment(
            audio.tobytes(), frame_rate=rate,
            sample_width=audio.dtype.itemsize,
            channels=1)
        audio_chunks = split_on_silence(
            aud,
            min_silence_len=100,
            silence_thresh=-45,
            keep_silence=20)
        if not audio_chunks:
            return {"transcription": ""}

        # run the whisper model inference
        with lock:
            result = transcribe(
                model, temp_file_path, task="translate")  # select the task to be "transcribe" or "translate"

        print(result)

        return {"transcription": result["text"], "temperature": result["segments"][0]["temperature"], "no_speech_prob": result["segments"][0]["no_speech_prob"], "language": result["language"]}
        # return {"transcription": result["text"]}

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"message": str(e)})

    finally:
        # delete the temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True, debug=False)
