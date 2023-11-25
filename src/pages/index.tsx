import { Card } from '@nextui-org/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect/dist/core';

const VoiceWaves = dynamic({
  loader: () => import('@/components/VoiceWaves').then((ctx) => ctx.VoiceWaves),
  ssr: false,
});

const HomePage = observer(() => {
  const typewriterRef = useRef(null);
  useEffect(() => {
    typewriterRef.current = new Typewriter('#typewriter', {
      loop: false,
      delay: 40,
      deleteSpeed: 10,
      shuffle: true,
    });
    return () => {
      if (typewriterRef.current) {
        typewriterRef.current.deleteAll();
        typewriterRef.current = null;
      }
    };
  }, []);
  return (
    <main className="w-full min-h-[calc(100vh-70px)] p-2 flex flex-col justify-center items-center">
      <Card className="w-full lg:w-[800px] p-4 lg:p-[48px] bg-[#CFDCFF]" radius="sm" shadow="sm">
        <div className="rounded-md overflow-hidden">
          <VoiceWaves
            onText={(text, isTranscribing) => {
              if (isTranscribing) {
                typewriterRef.current.typeString(' ').typeString(text).start();
              } else {
                typewriterRef.current.deleteAll().typeString('').start();
              }
            }}
          />
          <div id="typewriter" className="py-8 px-4 bg-[#EAF1FF] text-[#55627C] text-base"></div>
        </div>
      </Card>
    </main>
  );
});

export default HomePage;
