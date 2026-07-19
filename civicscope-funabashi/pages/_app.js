import { Shippori_Mincho, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/globals.css";

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-shippori",
  display: "swap"
});

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap"
});

// Google Analyticsを使う場合のみ、環境変数で有効化する
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function App({ Component, pageProps }) {
  return (
    <div className={`${shippori.variable} ${noto.variable} ${mono.variable} font-body`}>
      {/* AdSenseの<script>タグは pages/_document.js のHead内に直接記述しています
          （AdSenseの確認・審査は初期HTMLを見るため、next/scriptでの遅延読み込みではなく
          常に静的HTMLに含まれる形にする必要があるため）。 */}

      {GA_ID ? (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      ) : null}

      <div className="flex min-h-screen flex-col bg-paper">
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
