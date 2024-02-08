import '@/styles/globals.css';
import type { AppType } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { NextUIProvider } from '@nextui-org/react';
import { RootLayout } from '@/components/Layout';

const MyApp: AppType<{ session: any }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" enableSystem={false}>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </ThemeProvider>
    </NextUIProvider>
  );
};

export default MyApp;
