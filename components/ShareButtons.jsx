import { useRouter } from "next/router";
import { siteConfig } from "../data/siteConfig";

// Facebook・X（旧Twitter）へのシンプルなシェアボタン。
// 各SNSの「共有ダイアログを開く」公式URL形式を使うだけなので、APIキーや
// アプリ登録は不要（Fukuoka Factsにあるようなシェア数バッジは、公開APIでの
// 取得が実質廃止されているため付けていない）。
// url/title を省略すると、現在表示中のページのURL・<title>を自動で使う。
export default function ShareButtons({ url, title, className = "" }) {
  const router = useRouter();
  const pageUrl = url || `${siteConfig.url}${router.asPath.split("#")[0]}`;
  const pageTitle = title || (typeof document !== "undefined" ? document.title : siteConfig.name);

  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const xHref = `https://x.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`;

  function openShareWindow(e, href) {
    e.preventDefault();
    window.open(href, "share", "width=600,height=500,noopener,noreferrer");
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={fbHref}
        onClick={(e) => openShareWindow(e, fbHref)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebookでシェアする"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-4 py-2 text-xs font-bold text-white shadow-pop transition-transform hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06C2 17.06 5.66 21.2 10.44 21.95V14.9H7.9v-2.84h2.54v-2.17c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.84h2.77l-.44 2.84h-2.33v7.05C18.34 21.2 22 17.06 22 12.06z" />
        </svg>
        シェアする
      </a>
      <a
        href={xHref}
        onClick={(e) => openShareWindow(e, xHref)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Xでポストする"
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white shadow-pop transition-transform hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        ポスト
      </a>
    </div>
  );
}
