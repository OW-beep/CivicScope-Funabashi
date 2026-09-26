/**
 * 楽天市場商品検索API（IchibaItem/Search）の薄いラッパー。
 *
 * 楽天は2026年に仕様変更を重ねており、現時点（2026-07-01版）の仕様は以下の通り。
 * 古いバージョンのURLを使うと "wrong_parameter / API Configuration not found" という
 * エラーになるため、バージョン番号が変わったら随時このファイルを更新すること。
 *
 * - エンドポイント: https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701
 *   （旧 app.rakuten.co.jp/services/api/... は完全停止済み）
 * - applicationId に加えて accessKey が必須（クエリパラメータかヘッダーのどちらでも可。ここではクエリで送る）
 * - formatVersion=2 を指定しているが、実際のレスポンスはドキュメント記載と異なり
 *   キー名が "Items"（大文字）のままで、配列の各要素はフラットな商品情報オブジェクト
 *   （{item: {...}} のようなネストはない）。ドキュメントより実際のレスポンスを信用してこの形で解析する。
 *
 * - RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定の場合は何もせず null を返す
 *   （キー未登録でもビルド・他ページが壊れないようにするため）。
 * - Pages Router専用。getStaticProps / getServerSideProps / pages/api からのみ呼び出すこと。
 *   （このファイルをコンポーネントから直接importしてクライアント側で使わない。
 *   キーをブラウザに渡さないよう、Next.jsのgetStaticProps等はビルド・サーバー側でのみ実行される。）
 * - 楽天APIは呼び出し頻度に上限があるため、Next.jsのfetchキャッシュで
 *   1日単位（86400秒）に再取得を抑える。
 */

import { siteConfig } from "../data/siteConfig";

const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

/**
 * @typedef {Object} RakutenItem
 * @property {string} name
 * @property {number} price
 * @property {string} url - affiliateId設定時はアフィリエイトリンク、未設定時は通常の商品URL
 * @property {string|null} imageUrl
 * @property {string} shopName
 */

/**
 * @param {string} keyword
 * @param {number} hits
 * @returns {Promise<RakutenItem[]|null>}
 */
export async function searchRakutenItems(keyword, hits = 3) {
  const applicationId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!applicationId || !accessKey) {
    console.warn(
      `[rakuten] RAKUTEN_APP_ID または RAKUTEN_ACCESS_KEY が未設定のため「${keyword}」の検索をスキップしました`
    );
    return null;
  }

  const paramsObj = {
    format: "json",
    formatVersion: "2",
    keyword,
    applicationId,
    accessKey,
    hits: String(hits),
    sort: "standard"
  };
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) paramsObj.affiliateId = affiliateId;

  // URLSearchParamsはスペースを"+"にエンコードするが、楽天側が"+"を区切りのスペースとして
  // 解釈せず検索結果0件になるケースがあるため、encodeURIComponent（%20）で明示的に組み立てる
  const query = Object.entries(paramsObj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // アプリ登録時に指定した「Allowed websites」のドメインとRefererが一致しないと弾かれる。
  // サイトの正式ドメインは data/siteConfig.js の siteConfig.url に一元化されているため、
  // それをそのまま使う（ここにドメインをハードコードすると、siteConfig側の値とズレて
  // 楽天API側でwrong_parameterエラーになるリスクがあるため）。
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

  try {
    const res = await fetch(`${ENDPOINT}?${query}`, {
      headers: { Referer: siteUrl, Origin: siteUrl },
      // 楽天APIの呼び出し回数を抑えるため、同じキーワードの結果は1日キャッシュする
      next: { revalidate: 60 * 60 * 24 }
    });
    const rawText = await res.text();
    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      console.warn(`[rakuten] 「${keyword}」のレスポンスがJSONとして解釈できませんでした。body=${rawText.slice(0, 500)}`);
      return null;
    }

    if (!res.ok || data.error) {
      console.warn(
        `[rakuten] 「${keyword}」の検索が失敗しました。status=${res.status} error=${data.error} description=${data.error_description}`
      );
      return null;
    }
    if (!data.Items || data.Items.length === 0) {
      // 原因切り分け用に、レスポンスの生の内容をそのままログに出す（countが0件なのか、
      // itemsのキー名自体が想定と違うのかを確認するため）
      console.warn(
        `[rakuten] 「${keyword}」の検索結果が0件でした。送信keyword=${encodeURIComponent(keyword)} / rawBody=${rawText.slice(0, 800)}`
      );
      return null;
    }

    return data.Items.map((item) => ({
      name: item.itemName,
      price: item.itemPrice,
      url: item.affiliateUrl || item.itemUrl,
      imageUrl: item.mediumImageUrls?.[0] ?? null,
      shopName: item.shopName
    }));
  } catch (err) {
    // ネットワークエラー等でページ自体が落ちないよう、失敗時は「表示なし」にフォールバックする
    console.warn(`[rakuten] 「${keyword}」の検索中に例外が発生しました:`, err);
    return null;
  }
}
