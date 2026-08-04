import Head from "next/head";
import { siteConfig } from "../data/siteConfig";

// 全ページ共通のSEOタグ（title・description・canonical・OGP・Twitter Card・JSON-LD）を
// まとめて出力するコンポーネント。個別ページはこれを使うだけで最低限のSEO対応が揃う。
//
// - path: "/dashboard" のようにドメインを含まないパス（ルート相対）
// - image: OGP画像の絶対パス省略時はサイト共通のog-image.pngを使用
// - jsonLd: 追加のJSON-LD構造化データ（オブジェクトまたは配列）。記事ページのArticleなど。
export default function Seo({ title, description, path = "", image, type = "website", jsonLd }) {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}/og-image.png`;
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={siteConfig.locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {siteConfig.twitter ? <meta name="twitter:site" content={siteConfig.twitter} /> : null}

      {jsonLdList.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}
