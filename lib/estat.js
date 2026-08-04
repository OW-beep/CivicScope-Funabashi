// 政府統計の総合窓口（e-Stat）のAPIを使って、船橋市の町丁・字別人口を取得するユーティリティ。
// 国勢調査の「小地域集計」を対象にしている。
//
// 利用にはe-StatのアプリケーションID（無料のユーザー登録で取得可能）が必要。
// このアプリケーションIDは秘密情報として扱い、コードに直接書かず、環境変数
// ESTAT_APP_ID に設定して使う（ローカルは .env.local、本番はVercelの環境変数設定）。
//
// 出典: 政府統計の総合窓口(e-Stat) 国勢調査 小地域集計
// https://www.e-stat.go.jp/stat-search/files?toukei=00200521
//
// 正直な前提: この経路は国勢調査（5年に1度）ベースのため、最新性は市の毎月人口統計には劣る。
// また、都道府県ごとに統計表ID（statsDataId）が異なるため、まずgetStatsListで該当の
// 統計表を探し、その後getStatsDataで実際の数値を取る、という2段階のAPI呼び出しになる。

const ESTAT_BASE = "https://api.e-stat.go.jp/rest/3.0/app/json";
const CENSUS_STATS_CODE = "00200521"; // 国勢調査
const FUNABASHI_CITY_CODE = "12204";
const CHIBA_KEYWORD = "千葉県";
// 「男女別人口総数及び世帯総数」表を対象にする（人口・世帯数の総数だけがほしいため、
// 年齢階級別など他の詳細な表は対象にしない）
const TABLE_TITLE_KEYWORD = "人口総数及び世帯総数";

function getAppId() {
  const appId = process.env.ESTAT_APP_ID;
  if (!appId) throw new Error("ESTAT_APP_ID が設定されていません（.env.local またはVercelの環境変数を確認してください）。");
  return appId;
}

function toArray(x) {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

// getStatsList: 千葉県の「男女別人口総数及び世帯総数」（小地域）の統計表IDを探す。
// 都道府県ごとに統計表IDが異なるため、タイトル文字列で該当の表を特定する。
async function findFunabashiPopulationTableId(surveyYear) {
  const appId = getAppId();
  const url = `${ESTAT_BASE}/getStatsList?appId=${appId}&statsCode=${CENSUS_STATS_CODE}&searchKind=2&surveyYears=${surveyYear}`;

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!res.ok) throw new Error(`getStatsList failed (${res.status})`);

  const json = await res.json();
  const tableInf = json?.GET_STATS_LIST?.DATALIST_INF?.TABLE_INF;
  const tables = toArray(tableInf);

  for (const t of tables) {
    const title = typeof t?.TITLE === "string" ? t.TITLE : t?.TITLE?.["$"] || "";
    if (title.includes(TABLE_TITLE_KEYWORD) && title.includes(CHIBA_KEYWORD)) {
      return t["@id"];
    }
  }
  return null;
}

// getStatsData: 見つけた統計表IDから実際の数値データを取得し、船橋市（市区町村コード12204）の
// 町丁だけを取り出す。項目（人口総数・世帯総数）はコードでなく名称の文字列一致で判定する
// （年度によってコード体系が変わりうるため）。
async function fetchTownPopulationFromTable(statsDataId) {
  const appId = getAppId();
  const url = `${ESTAT_BASE}/getStatsData?appId=${appId}&statsDataId=${statsDataId}&limit=100000`;

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!res.ok) throw new Error(`getStatsData failed (${res.status})`);

  const json = await res.json();
  const statData = json?.GET_STATS_DATA?.STATISTICAL_DATA;
  if (!statData) return [];

  const classObjs = toArray(statData?.CLASS_INF?.CLASS_OBJ);
  const areaObj = classObjs.find((c) => c["@id"] === "area");
  const catObj = classObjs.find((c) => c["@id"] && String(c["@id"]).startsWith("cat"));

  const areaClasses = toArray(areaObj?.CLASS);
  const catClasses = toArray(catObj?.CLASS);
  const catObjId = catObj?.["@id"];

  const areaNameByCode = new Map(areaClasses.map((c) => [c["@code"], c["@name"]]));

  // 「総数」を含み、性別に分かれていない項目（人口総数・世帯総数）を選ぶ
  const populationCat = catClasses.find((c) => /人口.*総数/.test(c["@name"]) && !/男|女/.test(c["@name"]));
  const householdCat = catClasses.find((c) => /世帯.*総数/.test(c["@name"]));

  const values = toArray(statData?.DATA_INF?.VALUE);

  const byTown = new Map();
  for (const v of values) {
    const areaCode = v["@area"];
    if (!areaCode || !String(areaCode).startsWith(FUNABASHI_CITY_CODE)) continue;

    const townName = areaNameByCode.get(areaCode);
    if (!townName) continue;

    const catCode = catObjId ? v[`@${catObjId}`] : null;
    const raw = v["$"];
    // 秘匿値（人口・世帯数が1〜3の町丁は"X"などで秘匿される）はnullのまま扱う
    const num = raw === "-" || raw === "X" || raw == null ? null : Number(raw);

    if (!byTown.has(townName)) byTown.set(townName, { label: townName, population: null, households: null });
    const entry = byTown.get(townName);

    if (populationCat && catCode === populationCat["@code"] && Number.isFinite(num)) entry.population = num;
    if (householdCat && catCode === householdCat["@code"] && Number.isFinite(num)) entry.households = num;
  }

  return Array.from(byTown.values()).filter((t) => t.population != null || t.households != null);
}

/**
 * 船橋市の町丁別人口・世帯数を取得する（国勢調査・小地域集計）。
 * 取得・解析に失敗した場合は空配列を返す（他の地区データの表示は妨げない）。
 * @param {number} surveyYear 国勢調査の調査年（例: 2020）
 * @returns [{ label, population, households }]
 */
export async function getFunabashiTownPopulation(surveyYear = 2020) {
  try {
    const statsDataId = await findFunabashiPopulationTableId(surveyYear);
    if (!statsDataId) return [];
    return await fetchTownPopulationFromTable(statsDataId);
  } catch (e) {
    console.warn("e-Stat町丁別人口の取得に失敗:", e);
    return [];
  }
}
