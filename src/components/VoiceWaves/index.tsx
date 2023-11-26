import { Disc2, Mic } from 'lucide-react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

const API_ENDPOINT = process.env["API_ENDPOINT"] || "http://1.13.101.86:8000"

export const VoiceWaves = observer(({ onText }: { onText?: (text: string, isTranscribing: boolean) => void }) => {
  const recordRef = useRef(null);
  const recordWavesurferRef = useRef(null);
  const durationTimerRef = useRef(null);
  const recordDurationRef = useRef(0);
  const recordTimerRef = useRef(null);
  const isTranscribingRef = useRef(false);

  const store = useLocalObservable(() => ({
    devices: [],
    deviceId: 'default',

    isRecording: false,
    recordDurationStr: '00:00',

    set(v: Partial<typeof store>) {
      Object.assign(store, v);
    },
  }));

  const uploadAudio = useCallback(async (blob) => {
    if (blob.size === 0) {
      return;
    }
    // console.log('uploadAudio=>', blob);
    const dlUrl = URL.createObjectURL(blob).split('/');
    const filename = `${dlUrl[3]}.m4a`;
    const file = new File([blob], filename);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_ENDPOINT}/transcribe`, {
        // const response = await fetch('http://1.13.101.86:8000/test', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
        body: formData,
      });
      const data = await response.json();
      onText?.(data?.transcription || '', isTranscribingRef.current);
      // console.log('data=>', data);
    } catch (error) {
      console.log('error=>', error);
    }
  }, []);

  const getDevices = useCallback(() => {
    RecordPlugin.getAvailableAudioDevices().then((devices) => {
      const data = devices.map((device) => {
        return {
          value: device.deviceId,
          label: device.label || device.deviceId,
        };
      });
      store.set({ devices: data });
    });
  }, []);

  useEffect(() => {
    getDevices();

    recordWavesurferRef.current = WaveSurfer.create({
      container: '#recordWavesurfer',
      waveColor: '#D9E6FE',
      progressColor: '#96C0FC',
      barGap: 3,
      barWidth: 4,
      barHeight: 2,
      barRadius: 4,
      cursorWidth: 0,
      height: 60,
      hideScrollbar: true,
    });

    recordRef.current = recordWavesurferRef.current.registerPlugin(RecordPlugin.create({ scrollingWaveform: true, renderRecordedAudio: false }));
    recordRef.current.on('record-end', (blob) => {
      uploadAudio(blob);
      if (isTranscribingRef.current) {
        recordRef.current.startRecording({ deviceId: store.deviceId });
      } else {
        clearInterval(recordTimerRef.current);
      }
    });

    return () => {
      recordWavesurferRef.current && recordWavesurferRef.current.destroy();
      recordTimerRef.current && clearInterval(recordTimerRef.current);
      durationTimerRef.current && clearInterval(durationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (store.isRecording) {
      durationTimerRef.current = setInterval(() => {
        recordDurationRef.current += 1;
        const recordDurationStr = new Date(recordDurationRef.current * 1000).toISOString().substr(14, 5);
        store.set({ recordDurationStr });
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }
  }, [store.isRecording]);

  const handleRecordingClick = useCallback(async () => {
    const isRecording = recordRef.current.isRecording();
    if (isRecording) {
      recordRef.current.stopRecording();
      isTranscribingRef.current = false;
      recordDurationRef.current = 0;
      store.set({ isRecording: false, recordDurationStr: '00:00' });
    } else {
      isTranscribingRef.current = true;
      await recordRef.current.startRecording({ deviceId: store.deviceId });
      store.set({ isRecording: true });
      recordTimerRef.current = setInterval(() => {
        recordRef.current.stopRecording();
      }, 2000);
    }
  }, []);

  return (
    <div className="py-8 px-2 lg:px-4 bg-white">
      {/* <select
        className="w-full p-2 text-sm rounded-md bg-[#F4F4F5] dark:bg-[#27272A]"
        value={store.deviceId}
        onChange={(event) => {
          store.set({ deviceId: event.target.value });
        }}
      >
        <option value="" disabled>
          Select a device
        </option>
        {store.devices.map((device) => {
          return (
            <option key={device.value} value={device.value}>
              {device.label}
            </option>
          );
        })}
      </select> */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-base text-[#0257F8]">{store.recordDurationStr}</div>
        <div id="recordWavesurfer" className="w-full px-6"></div>
        <div onClick={handleRecordingClick}>{store.isRecording ? <Disc2 color="red" className="cursor-pointer" /> : <Mic color="#0257F8" className="cursor-pointer" />}</div>
      </div>
    </div>
  );
});
