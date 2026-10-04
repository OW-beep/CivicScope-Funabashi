import { siteConfig } from "../data/siteConfig";

// 各ダッシュボードページ用の schema.org/Dataset 構造化データを作る。
// このサイトは「公開されているオープンデータを見やすく可視化する」のが本質なので、
// 通常のSEO（記事・ページ検索）とは別に、Google Dataset Search（データセット専用の検索面）
// からの発見も狙えるようにしている。他の記事・ページ向けSEOとは競合しない、別の流入経路。
//
// dataset.id / sourceUrl は data/siteConfig.js の datasets.* エントリを渡すことを想定。
export function buildDatasetJsonLd({ name, description, path, sourceUrl, sourceName = "船橋市", keywords = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    keywords: ["船橋市", "オープンデータ", ...keywords],
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: {
      "@type": "Organization",
      name: sourceName
    },
    distribution: sourceUrl
      ? {
          "@type": "DataDownload",
          contentUrl: sourceUrl
        }
      : undefined,
    isBasedOn: sourceUrl
  };
}
