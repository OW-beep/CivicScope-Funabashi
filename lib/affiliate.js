import { siteConfig } from "../data/siteConfig";

// Amazonの検索結果ページへのアフィリエイトリンクを作る（アソシエイトID付き）。
export function amazonSearchUrl(keyword) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${siteConfig.amazonAssociateTag}`;
}
