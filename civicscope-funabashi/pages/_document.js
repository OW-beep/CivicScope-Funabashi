import { Html, Head, Main, NextScript } from "next/document";
import { siteConfig } from "../data/siteConfig";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content={siteConfig.googleSiteVerification} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
