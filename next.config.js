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
  }
};

module.exports = nextConfig;
