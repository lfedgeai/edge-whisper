import asyncio
import json
import os
import tempfile
import threading
import traceback
import aiofiles
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydub.silence import split_on_silence
from pydub import AudioSegment
from whisper import load_model, transcribe


ALLOW_ORIGIN = os.getenv('ALLOW_ORIGIN', '')
WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'base')
WHISPERCPP_BIN = os.getenv('WHISPERCPP_BIN', './whispercpp_main')
WHISPERCPP_MODEL = os.getenv('WHISPERCPP_MODEL', './ggml-base-q5_1.bin')


app = FastAPI()

allow_origins = ['http://localhost:8000']
if ALLOW_ORIGIN:
    allow_origins.append(ALLOW_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


if WHISPER_MODEL:
    whisper_model = load_model(WHISPER_MODEL)

lock = threading.Lock()


async def run_model(input_path: str, result_path: str) -> dict[str]:
    if WHISPER_MODEL:
        with lock:
            result = transcribe(whisper_model, input_path, task='translate')
        return {
            'transcription': result['text'],
            'temperature': result['segments'][0]['temperature'],
            'no_speech_prob': result['segments'][0]['no_speech_prob'],
            'language': result['language'],
        }

    proc = await asyncio.create_subprocess_shell(
        f'{WHISPERCPP_BIN} -m {WHISPERCPP_MODEL} -tr -l auto \
            -oj -of {result_path} {input_path}',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await proc.communicate()

    print(f'whisper.cpp: {stdout.decode()}')

    result_path += '.json'
    if not os.path.exists(result_path):
        raise RuntimeError(f'whisper.cpp: {stderr.decode()}')

    async with aiofiles.open(result_path, 'r') as f:
        content = await f.read()

    result = json.loads(content)

    if len(result['transcription']) == 0:
        return {'transcription': ''}

    return {
        'transcription': result['transcription'][0]['text'].strip(),
        'temperature': 0,
        'no_speech_prob': 0,
        'language': result['result']['language'],
    }


@app.post('/transcribe')
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        print(file.filename)

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, file.filename)

            async with aiofiles.open(input_path, 'wb') as f:
                while content := await file.read(1024 * 30):
                    await f.write(content)

            aud = AudioSegment.from_file(input_path)
            aud = aud.set_frame_rate(16000).set_sample_width(2)

            if not split_on_silence(
                    aud,
                    min_silence_len=100,
                    silence_thresh=-45,
                    keep_silence=20):
                return {'transcription': ''}

            input_path = os.path.join(tmpdir, 'input.wav')
            aud.export(input_path, format='wav')

            result_path = os.path.join(tmpdir, 'result')
            result = await run_model(input_path, result_path)

        print(file.filename, result)
        return result

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={'message': str(e)})


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
