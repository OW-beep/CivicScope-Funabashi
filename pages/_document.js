import { Html, Head, Main, NextScript } from "next/document";
import { siteConfig } from "../data/siteConfig";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: siteConfig.nameJa,
  url: siteConfig.url,
  description: siteConfig.description
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "ja",
  description: siteConfig.description
};

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content={siteConfig.googleSiteVerification} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* 見出し用の丸ゴシック体「M PLUS Rounded 1c」。next/font/google経由だと
            Next.jsのバージョンによってはフォントメトリクス取得に失敗しビルドエラーになることが
            あるため、通常の<link>タグで読み込んでいる（tailwind.config.jsのfont-displayが参照）。 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
        {/* サイト全体で共通のJSON-LD（Organization・WebSite）。ページ固有の構造化データは
            各ページのSeoコンポーネント（jsonLd props）で追加する。 */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
