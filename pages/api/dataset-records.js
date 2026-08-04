// 食品営業施設一覧のような大きなデータセット（数百〜数千件）を、訪問者の初期ページ表示には
// 含めず、実際に検索を使うタイミングで初めて取得するためのAPIルート。
//
// これにより、ページ自体の初期データ量（Next.jsのgetStaticPropsの出力サイズ）を小さく保ち、
// ほとんどの訪問者（検索を使わない人）の読み込みを軽くする。検索を実際に使う訪問者だけが
// このAPI経由でデータを取得する。
//
// 許可するデータセットIDをホワイトリスト化し、任意のBODIKリソースを取得できる汎用プロキシに
// ならないようにしている。

import { getDatasetRecords } from "../../lib/bodik";
import { datasets } from "../../data/siteConfig";

// このAPI経由での取得を許可するデータセット（レコード数が多く、遅延取得が有効なもののみ）
const ALLOWED_DATASET_KEYS = ["foodBusiness"];

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key || !ALLOWED_DATASET_KEYS.includes(key)) {
    res.status(400).json({ error: "無効なデータセット指定です。" });
    return;
  }

  const datasetConfig = datasets[key];
  if (!datasetConfig?.id) {
    res.status(400).json({ error: "データセットが見つかりません。" });
    return;
  }

  try {
    const data = await getDatasetRecords(datasetConfig.id);
    // ブラウザ・CDN側で1日キャッシュ（オープンデータは頻繁には変わらないため）
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json({ fields: data.fields, records: data.records });
  } catch (e) {
    res.status(502).json({ error: "データの取得に失敗しました。" });
  }
}
