import { siteConfig } from "../data/siteConfig";
import { articles } from "../data/articles";

const STATIC_PATHS = [
  "",
  "/dashboard",
  "/children",
  "/schools",
  "/senior-housing",
  "/welfare",
  "/public-safety",
  "/finance",
  "/gender-participation",
  "/employment",
  "/citizen-consultation",
  "/parks",
  "/area-map",
  "/district-explorer",
  "/rail-ridership",
  "/bus-ridership",
  "/childcare",
  "/chokai",
  "/food-businesses",
  "/life-sanitation",
  "/disaster-prevention",
  "/dog-registration",
  "/articles",
  "/guide",
  "/data-methodology",
  "/about",
  "/contact",
  "/privacy",
  "/terms"
];

function generateSitemap() {
  const staticUrls = STATIC_PATHS.map((p) => ({ loc: `${siteConfig.url}${p}` }));
  const articleUrls = articles.map((a) => ({
    loc: `${siteConfig.url}/articles/${a.slug}`,
    lastmod: a.date
  }));
  const urls = [...staticUrls, ...articleUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`
  )
  .join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml");
  res.write(generateSitemap());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
