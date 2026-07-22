import { siteConfig } from "../data/siteConfig";
import { articles } from "../data/articles";

const STATIC_PATHS = [
  "",
  "/dashboard",
  "/children",
  "/schools",
  "/senior-housing",
  "/chokai",
  "/food-businesses",
  "/life-sanitation",
  "/disaster-prevention",
  "/dog-registration",
  "/articles",
  "/about",
  "/contact",
  "/privacy",
  "/terms"
];

function generateSitemap() {
  const urls = [
    ...STATIC_PATHS.map((p) => `${siteConfig.url}${p}`),
    ...articles.map((a) => `${siteConfig.url}/articles/${a.slug}`)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
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
