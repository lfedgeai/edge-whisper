'use client'
import { useMicVAD, utils } from "@ricky0123/vad-react"
import { motion } from "framer-motion"
import { useState } from "react"

import * as ort from "onnxruntime-web"

ort.env.wasm.wasmPaths = {
  "ort-wasm-simd-threaded.wasm": "/ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd.wasm": "/ort-wasm-simd.wasm",
  "ort-wasm.wasm": "/ort-wasm.wasm",
  "ort-wasm-threaded.wasm": "/ort-wasm-threaded.wasm",
}


// const API_ENDPOINT = 'http://1.13.101.86:8000'
const API_ENDPOINT = 'https://edgeai.yomo.dev'

// const domContainer = document.querySelector("#demo") as Element
// const root = createRoot(domContainer)
// root.render(<Demo />)

function Demo() {
  const [demoStarted, setDemoStarted] = useState(false)

  return (
    <div className="pb-2">
      {!demoStarted && (
        <StartDemoButton startDemo={() => setDemoStarted(true)} />
      )}
      {demoStarted && <ActiveDemo />}
    </div>
  )
}

export default Demo;

function StartDemoButton({ startDemo }: { startDemo: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        onClick={startDemo}
        className="text-xl text-black bg-lime-400 font-bold px-3 py-2 rounded hover:bg-black hover:text-white"
      >
        Start demo
      </button>
    </div>
  )
}

function ActiveDemo() {
  const [audioList, setAudioList] = useState<[string, string][]>([])
  const vad = useMicVAD({
    modelURL: "/silero_vad.onnx",
    workletURL: "/vad.worklet.bundle.min.js",
    startOnLoad: true,
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio)
      const base64 = utils.arrayBufferToBase64(wavBuffer)
      const url = `data:audio/wav;base64,${base64}`

      const file = new File([wavBuffer], "audio.wav");
      const formData = new FormData();
      formData.append('file', file);

      var text = "";
      try {
        const response = await fetch(`${API_ENDPOINT}/transcribe?lang=zh`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        text = data.transcription;
      } catch (error) {
        console.error('error=>', error);
      }

      setAudioList((old) => [[url, text], ...old])
    },
  })

  if (vad.loading) {
    return <Loading />
  }

  if (vad.errored) {
    console.log(vad.errored);
    return <Errored />
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 flex items-center">
        <div className="w-24 flex justify-center items-center">
          {vad.listening && vad.userSpeaking && <HighEnergyCube />}
          {vad.listening && !vad.userSpeaking && <LowEnergyCube />}
          {!vad.listening && <DeactivatedCube />}
        </div>
        <div className="w-24 flex justify-start items-center">
          <div
            className="underline underline-offset-2 text-black grow"
            onClick={vad.toggle}
          >
            {vad.listening && "Pause"}
            {!vad.listening && "Start"}
          </div>
        </div>
      </div>
      <ol
        id="playlist"
        className="self-center pl-0 max-h-[400px] overflow-y-auto no-scrollbar list-none"
      >
        {audioList.map(([audioURL, text]) => {
          return (
            <li className="pl-0" key={audioItemKey(audioURL)}>
              <p>Text: {text}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const audioItemKey = (audioURL: string) => audioURL.substring(-10)

function Loading() {
  return (
    <div className="flex justify-center">
      <div className="animate-pulse text-2xl text-black">Loading</div>
    </div>
  )
}

function Errored() {
  return (
    <div className="flex justify-center">
      <div className="text-2xl text-black">Something went wrong</div>
    </div>
  )
}

const DeactivatedCube = () => {
  return (
    <div className="bg-gradient-to-l from-[#2A2A2A] to-[#474747] h-10 w-10 rounded-[6px]" />
  )
}

const LowEnergyCube = () => {
  return (
    <motion.div className="bg-gradient-to-l from-[#7928CA] to-[#008080] h-10 w-10 rounded-[6px] low-energy-spin" />
  )
}

const HighEnergyCube = () => {
  return (
    <motion.div className="bg-gradient-to-l from-[#7928CA] to-[#FF0080] h-10 w-10 rounded-[6px] high-energy-spin" />
  )
}
