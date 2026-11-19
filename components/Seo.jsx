import Head from "next/head";
import { siteConfig } from "../data/siteConfig";

// 全ページ共通のSEOタグ（title・description・canonical・OGP・Twitter Card・JSON-LD）を
// まとめて出力するコンポーネント。個別ページはこれを使うだけで最低限のSEO対応が揃う。
//
// - path: "/dashboard" のようにドメインを含まないパス（ルート相対）
// - image: OGP画像の絶対パス省略時はサイト共通のog-image-v2.pngを使用
//   （2026-11-18更新：旧og-image.pngは数字が古かったため、ファイル名を変えて
//   X等のカードキャッシュを回避する。旧ファイルは削除済み）
// - jsonLd: 追加のJSON-LD構造化データ（オブジェクトまたは配列）。記事ページのArticleなど。
export default function Seo({ title, description, path = "", image, type = "website", jsonLd, noindex = false }) {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}/og-image-v2.png`;
  // OGP画像の代替テキスト。画像内に数字は入れていない
  // （数が流動的なため、2026-11-18に数字・日付を削除）。
  const ogImageAlt =
    "CivicScope Funabashi（シビックスコープ船橋）— 船橋市のオープンデータを、暮らしの解像度に変える。";
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex,follow" /> : null}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content={siteConfig.locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
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
