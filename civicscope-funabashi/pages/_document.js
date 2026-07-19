import { Html, Head, Main, NextScript } from "next/document";
import { siteConfig } from "../data/siteConfig";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content={siteConfig.googleSiteVerification} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* AdSenseの審査・確認は初期HTML内にこのタグが存在するかを見るため、
            next/scriptではなく素の<script>タグとしてHead内に直接埋め込んでいます。 */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${siteConfig.adsensePublisherId}`}
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
