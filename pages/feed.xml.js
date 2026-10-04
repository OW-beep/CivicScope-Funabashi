import { getArticlesSortedByDate } from "../data/articles";
import { siteConfig } from "../data/siteConfig";

// 新着記事のRSSフィード（/feed.xml）。RSSリーダーでの購読や、
// 他サイト・まとめサイトからの新着検知に使われることを想定している。
// 直近30件のみを配信する（全件配信するとフィードが肥大化するため）。
function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFeed(articles) {
  const items = articles
    .slice(0, 30)
    .map((a) => {
      const url = `${siteConfig.url}/articles/${a.slug}`;
      const pubDate = new Date(`${a.date}T00:00:00+09:00`).toUTCString();
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ja</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;
}

export async function getServerSideProps({ res }) {
  const feed = buildFeed(getArticlesSortedByDate());
  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  // CDNで1日キャッシュ（記事の追加頻度に合わせた妥当な長さ）
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate");
  res.write(feed);
  res.end();
  return { props: {} };
}

export default function Feed() {
  return null;
}
