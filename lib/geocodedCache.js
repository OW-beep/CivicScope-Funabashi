// scripts/geocode-facilities.js が事前生成した data/geocoded/*.json を読み込むための
// ヘルパー。ビルド時に通信を発生させない（＝Vercelの静的ページ生成タイムアウトを
// 避ける）ため、getStaticProps側ではここ経由でしか座標化データを読まない設計にしている。
//
// ファイルがまだ無い場合（scripts/geocode-facilities.js を一度も実行していない場合）は
// 空配列を返す。ビルドを壊さないことを優先する。

import fs from "fs";
import path from "path";

const GEOCODED_DIR = path.join(process.cwd(), "data", "geocoded");

/**
 * @param {string} name plazas / featuredParks / publicNurseryFacilities / seniorHousingList など
 * @returns [{ label, category, lat, lng }]
 */
export function loadGeocodedPoints(name) {
  try {
    const filePath = path.join(GEOCODED_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`geocoded/${name}.json の読み込みに失敗しました:`, e);
    return [];
  }
}
