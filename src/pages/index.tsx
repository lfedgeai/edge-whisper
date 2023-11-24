import { Card } from '@nextui-org/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import Typewriter from 'typewriter-effect/dist/core';

const VoiceWaves = dynamic({
  loader: () => import('@/components/VoiceWaves').then((ctx) => ctx.VoiceWaves),
  ssr: false,
});

const HomePage = observer(() => {
  return (
    <main className="w-full min-h-[calc(100vh-70px)] p-2 flex flex-col justify-center items-center">
      <Card className="w-full lg:w-[800px] p-4 lg:p-[48px] bg-[#CFDCFF]" radius="sm" shadow="sm">
        <div className="rounded-md overflow-hidden">
          <VoiceWaves
            onText={(text) => {
              new Typewriter('#typewriter', {
                strings: text,
                autoStart: true,
              });
            }}
          />
          <div id="typewriter" className="py-8 px-4 bg-[#EAF1FF] text-[#55627C] text-base"></div>
        </div>
      </Card>
    </main>
  );
});

export default HomePage;
