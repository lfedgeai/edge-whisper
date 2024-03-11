import { useMicVAD, utils } from '@ricky0123/vad-react';
import { motion } from "framer-motion";
import { Disc2, Mic } from 'lucide-react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import * as ort from "onnxruntime-web";


ort.env.wasm.wasmPaths = {
  "ort-wasm-simd-threaded.wasm": "/ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd.wasm": "/ort-wasm-simd.wasm",
  "ort-wasm.wasm": "/ort-wasm.wasm",
  "ort-wasm-threaded.wasm": "/ort-wasm-threaded.wasm",
}

const API_ENDPOINT = process.env['NEXT_PUBLIC_API_ENDPOINT'] || 'http://1.13.101.86:8000';

export const VoiceWaves = observer(
  ({
    onText,
    lang,
  }: {
    onText?: (
      data: {
        transcription: string;
        temperature: number;
        no_speech_prob: number;
        language: string;
      },
      isTranscribing: boolean,
    ) => void;
    lang?: string;
  }) => {
    const store = useLocalObservable(() => ({
      devices: [],
      deviceId: 'default',

      isRecording: false,
      recordDurationStr: '00:00',

      set(v: Partial<typeof store>) {
        Object.assign(store, v);
      },
    }));

    // use VAD
    const vad = useMicVAD({
      modelURL: "/silero_vad.onnx",
      workletURL: "/vad.worklet.bundle.min.js",
      startOnLoad: false,
      onSpeechEnd: async (audio) => {
        const wavBuffer = utils.encodeWAV(audio)
        const file = new File([wavBuffer], "audio.wav");
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(`${API_ENDPOINT}/transcribe?lang=${lang || 'en'}`, {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          console.log("lang", lang, "resp", data);
          onText?.(data, true);
          // text = data.transcription;
        } catch (error) {
          console.error('error=>', error);
        }
      },
    });

    if (vad.loading) {
      console.log("vad loading...");
    }

    if (vad.errored) {
      console.log(vad.errored);
    }

    const startActive = function(){
      if (store.isRecording) {
        vad.pause();
        store.set({recordDurationStr: '00:00', isRecording: false});
        return;
      }
      vad.start();
      store.set({isRecording: true});
    }

    return (
      <div className="py-8 px-2 lg:px-4 bg-white">
        <style jsx>{`
@tailwind base;
@tailwind components;
@tailwind utilities;

.low-energy-spin {
  animation: spin 2.5s linear forwards infinite;
}

.high-energy-spin {
  animation: spin 0.6s linear forwards infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

#playlist li:first-child {
  max-height: 0;
  opacity: 0;
  animation: grow 1s ease-in-out forwards;
}

@keyframes grow {
  to {
    max-height: 100px;
    opacity: 1;
  }
}

.no-scrollbar {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
        `}</style>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-base text-[#0257F8]">{store.recordDurationStr}</div>
          <div id="recordWavesurfer" className="w-full px-6 justify-center items-center">
            {vad.listening && vad.userSpeaking && <HighEnergyCube />}
            {vad.listening && !vad.userSpeaking && <LowEnergyCube />}
            {!vad.listening && <DeactivatedCube />}
          </div>
          <div onClick={startActive}>
            {store.isRecording
              ? <Disc2 color="red" className="cursor-pointer" />
              : <Mic color="#0257F8" className="cursor-pointer" />}
          </div>
        </div>
      </div>
    );
  },
);

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