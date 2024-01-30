### zihan 2023-12
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

# 2、声明一个 源 列表；重点：要包含跨域的客户端 源
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://edge-ai.yomo.run",
]

# 3、配置 CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的源
    allow_credentials=True,  # 支持 cookie
    allow_methods=["*"],  # 允许使用的请求方法
    allow_headers=["*"]  # 允许携带的 Headers
)

# app.add_middleware(
#         CORSMiddleware,
#         #       allow_origins=["*"],
#         allow_origins=["http://localhost:3000"],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#         )

# 加载 Whisper 模型
model = load_model("large-v3", device="cuda")  # 选择 medium 模型

lock = threading.Lock()


@app.post("/test")
def test():
    return {"id": 12345}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_file_path = None
    try:
        print(file)

        # 创建唯一的临时文件名
        temp_file_path = f"temp_{uuid.uuid4().hex}.ogg"

        # 异步保存上传的文件
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            while content := await file.read(1024*30):
                await out_file.write(content)

        # 进行静音检测
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

        # 使用 Whisper 进行语音识别
        # result = asyncio.to_thread(transcribe
        with lock:
            result = transcribe(
                model, temp_file_path, task="translate")  # 选择适当的语言,支持翻译

        print(result)

        return {"transcription": result["text"], "temperature": result["segments"][0]["temperature"], "no_speech_prob": result["segments"][0]["no_speech_prob"], "language": result["language"]}
        # return {"transcription": result["text"]}

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"message": str(e)})

    finally:
        # 删除临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True, debug=False)
