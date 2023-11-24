import { observer, useLocalObservable } from 'mobx-react-lite';
import { PlayIcon } from '../Icons';
import { Disc2, Mic, Pause } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { useEffect, useRef } from 'react';
import { cn } from '@nextui-org/react';

export const VoiceWaves = observer(({ onText }: { onText?: (text: string) => void }) => {
  const recordRef = useRef(null);
  const recordWavesurferRef = useRef(null);
  const recordDurationIntervalRef = useRef(null);
  const recordDurationRef = useRef(0);

  const recordIntervalRef = useRef(null);
  const isTranscribing = useRef(false);

  const wavesurferRef = useRef(null);
  const durationRef = useRef(0);

  const store = useLocalObservable(() => ({
    step: 1, // 1: record, 2: play

    devices: [],
    deviceId: 'default',

    isRecording: false,
    recordDurationStr: '00:00',

    playing: false,
    durationStr: '00:00',

    set(v: Partial<typeof store>) {
      Object.assign(store, v);
    },
  }));

  const uploadAudio = (blob) => {
    if (blob.size === 0) {
      return;
    }
    console.log('uploadAudio=>', blob);
    // const dlUrl = URL.createObjectURL(blob).split('/');
    // const filename = `${dlUrl[3]}.wav`;
    // const file = new File([blob], filename);
    // const formData = new FormData();
    // formData.append('audio', file);
  };

  useEffect(() => {
    RecordPlugin.getAvailableAudioDevices().then((devices) => {
      const data = devices.map((device) => {
        return {
          value: device.deviceId,
          label: device.label || device.deviceId,
        };
      });
      store.set({ devices: data });
    });

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
      // store.set({ step: 2, isRecording: false });

      // const recordedUrl = URL.createObjectURL(blob);

      // wavesurferRef.current = WaveSurfer.create({
      //   container: '#waveform',
      //   waveColor: '#D9E6FE',
      //   progressColor: '#96C0FC',
      //   barGap: 3,
      //   barWidth: 4,
      //   barHeight: 2,
      //   barRadius: 4,
      //   cursorWidth: 0,
      //   height: 60,
      //   hideScrollbar: true,
      //   url: recordedUrl,
      // });

      // wavesurferRef.current.on('ready', () => {
      //   const duration = wavesurferRef.current.getDuration();
      //   const durationStr = new Date(duration * 1000).toISOString().substr(14, 5);
      //   store.set({ durationStr });
      //   durationRef.current = duration;
      // });

      // wavesurferRef.current.on('finish', () => {
      //   wavesurferRef.current.seekTo(0);
      //   const durationStr = new Date(durationRef.current * 1000).toISOString().substr(14, 5);
      //   store.set({ playing: false, durationStr });
      // });

      uploadAudio(blob);

      if (isTranscribing.current) {
        const isRecording = recordRef.current.isRecording();
        if (!isRecording) {
          recordRef.current.startRecording({ deviceId: store.deviceId }).then(() => {
            store.set({ isRecording: true });
          });
        }
      } else {
        clearInterval(recordIntervalRef.current);
      }
    });

    return () => {
      if (recordWavesurferRef.current) {
        recordWavesurferRef.current.destroy();
      }
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      if (recordDurationIntervalRef.current) {
        clearInterval(recordDurationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (wavesurferRef.current) {
      if (store.playing) {
        wavesurferRef.current.on('audioprocess', () => {
          const pos = wavesurferRef.current.getCurrentTime();
          const durationStr = new Date((durationRef.current - pos) * 1000).toISOString().substr(14, 5);
          store.set({ durationStr });
        });
      } else {
        wavesurferRef.current.un('audioprocess');
      }
    }
  }, [store.playing]);

  useEffect(() => {
    if (store.isRecording) {
      recordDurationIntervalRef.current = setInterval(() => {
        const recordDurationStr = new Date(recordDurationRef.current * 1000).toISOString().substr(14, 5);
        store.set({ recordDurationStr });
        recordDurationRef.current += 1;
      }, 1000);
    } else {
      if (recordDurationIntervalRef.current) {
        clearInterval(recordDurationIntervalRef.current);
      }
    }
  }, [store.isRecording]);

  return (
    <>
      <div
        className={cn('py-8 px-2 lg:px-4 bg-white', {
          hidden: store.step !== 1,
        })}
      >
        <select
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
        </select>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-base text-[#0257F8]">{store.recordDurationStr}</div>
          <div id="recordWavesurfer" className="w-full px-6"></div>
          <div
            onClick={() => {
              const isRecording = recordRef.current.isRecording();
              if (isRecording) {
                isTranscribing.current = false;
                recordRef.current.stopRecording();
                recordDurationRef.current = 0;
              } else {
                isTranscribing.current = true;
                recordIntervalRef.current = setInterval(() => {
                  recordRef.current.stopRecording();
                }, 2000);
                recordRef.current.startRecording({ deviceId: store.deviceId }).then(() => {
                  store.set({ isRecording: true });
                });
              }
              store.set({ isRecording: !store.isRecording });
            }}
          >
            {store.isRecording ? (
              <Disc2
                color="red"
                className={cn('cursor-pointer', {
                  'animate-pulse': store.isRecording,
                })}
              />
            ) : (
              <Mic color="#0257F8" className="cursor-pointer" />
            )}
          </div>
        </div>
      </div>

      <div
        className={cn('py-4 px-2 lg:px-4 bg-white', {
          hidden: store.step !== 2,
        })}
      >
        <div
          className="mb-2"
          onClick={() => {
            if (wavesurferRef.current) {
              store.set({ step: 1, playing: false, recordDurationStr: '00:00' });
              recordDurationRef.current = 0;
              wavesurferRef.current.destroy();
              // recordRef.current.startRecording({ deviceId: store.deviceId }).then(() => {
              //   store.set({ isRecording: true });
              // });
            }
          }}
        >
          <Mic color="#0257F8" className="cursor-pointer" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-base text-[#0257F8]">{store.durationStr}</div>
          <div id="waveform" className="w-full px-6"></div>
          <div
            onClick={() => {
              const wavesurfer = wavesurferRef.current;
              if (wavesurfer) {
                const isPlaying = wavesurfer.isPlaying();
                if (isPlaying) {
                  wavesurfer.pause();
                } else {
                  wavesurfer.play();
                  onText &&
                    onText(` Facilitates cross-cultural communication by real time translating languages from around the world. Cutting-edge translation tools that revolutionize global business and international
                  exchange.`);
                }
                store.set({ playing: !isPlaying });
              }
            }}
          >
            {store.playing ? <Pause color="#0257F8" /> : <PlayIcon className="cursor-pointer" />}
          </div>
        </div>
      </div>
    </>
  );
});
