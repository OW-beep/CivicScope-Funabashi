/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // BODIK/CKANのオープンデータサイトから画像を読み込む可能性に備えて許可
    remotePatterns: [
      { protocol: "https", hostname: "data.bodik.jp" },
      { protocol: "https", hostname: "odcs.bodik.jp" }
    ]
  }
};

module.exports = nextConfig;
