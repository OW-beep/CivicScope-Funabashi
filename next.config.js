/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発モード(npm run dev)のReact Strict Modeは、初期化処理を意図的に2回連続実行する。
  // MapLibre GL(WebGLで実際に描画するライブラリ)はこの2回連続実行と相性が悪く、
  // 1回目の地図をすぐ破棄して2回目を作る際に、地図が真っ白のまま止まることがある。
  // これは開発モード特有の現象で、本番ビルド(next build / Vercel)では発生しない。
  reactStrictMode: false,
  images: {
    // BODIK/CKANのオープンデータサイトから画像を読み込む可能性に備えて許可
    remotePatterns: [
      { protocol: "https", hostname: "data.bodik.jp" },
      { protocol: "https", hostname: "odcs.bodik.jp" }
    ]
  },
  webpack: (config, { isServer }) => {
    // lib/geocodedCache.js はNode.jsの fs/path を使う（事前生成した座標JSONを読むため）。
    // getStaticProps経由でしかfs部分は実行されない（サーバー専用）が、
    // lib/districtStats.js のように「間に別のlibファイルを1つ挟んで」importしていると、
    // Next.jsが「クライアント側では絶対に使われない」と静的解析しきれず、
    // ブラウザ向けバンドルの生成時にも fs を解決しようとしてビルドが失敗することがある。
    // ブラウザ向けビルドの時だけ、fs/path の解決失敗を「無いものとして無視してOK」にする
    // ことで、この失敗を防ぐ（実際にブラウザ側でfsが呼ばれることは無い）。
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    }
    return config;
  }
};

module.exports = nextConfig;
