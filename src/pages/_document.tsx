import Document, { Head, Html, Main, NextScript } from 'next/document';
export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
