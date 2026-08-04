import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizePopulationSeries, buildAnnualSeriesInsights, normalizeAgeDistribution, buildAgeDistributionInsights } from "../lib/bodik";
import {
  getFunabashiTownIndex,
  guessAddressField,
  aggregateByTown,
  buildDistributionInsights
} from "../lib/geo";
import { loadGeocodedPoints } from "../lib/geocodedCache";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";
import { getAgingRatioSeries, buildAgingRatioInsights } from "../data/agingRatio";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });
const TownBubbleMap = dynamic(() => import("../components/TownBubbleMap"), { ssr: false });
const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), { ssr: false });

const MIN_MATCH_RATIO = 0.2;

export async function getStaticProps() {
  let series = [];
  let statsInsights = null;
  let statsError = null;

  let fields = [];
  let records = [];
  let points = [];
  let boundary = [];
  let mapInsights = null;
  let mapAvailable = false;
  let listError = null;

  try {
    const statsData = await getDatasetRecords(datasets.seniorHousingStats.id);
    const normalized = normalizePopulationSeries(statsData);
    if (normalized) {
      series = normalized.series;
      statsInsights = buildAnnualSeriesInsights(series, "total");
    } else {
      statsError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    statsError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  let facilityMapPoints = [];
  let facilityMapStats = { matched: 0, total: 0 };

  try {
    const listData = await getDatasetRecords(datasets.seniorHousingList.id);
    fields = listData.fields;
    records = listData.records;

    if (!listData.datastoreActive) {
      listError = "このデータセットは検索可能な形式（DataStore）が未設定のため、原典サイトをご覧ください。";
    } else {
      const addressField = guessAddressField(fields, records);
      if (addressField) {
        const index = await getFunabashiTownIndex();
        const agg = aggregateByTown(records, addressField, index);
        if (agg.points.length && agg.matched / agg.total >= MIN_MATCH_RATIO) {
          points = agg.points;
          mapAvailable = true;
          mapInsights = buildDistributionInsights(points, records.length);
          try {
            boundary = await getFunabashiBoundaryRings();
          } catch (e) {
            boundary = [];
          }
        }
      }

      // 個別施設の座標は、ビルド時にその場で座標化するのではなく、
      // scripts/geocode-facilities.js を手元で事前実行して作った
      // data/geocoded/seniorHousingList.json をここで読むだけにしている。
      // （ビルド時にGSIへ都度アクセスすると、Vercelの静的ページ生成の60秒タイムアウトを
      // 超えてビルドが失敗するため。詳しい経緯はそのスクリプトのコメントを参照）
      facilityMapPoints = loadGeocodedPoints("seniorHousingList");
      facilityMapStats = { matched: facilityMapPoints.length, total: records.length };
    }
  } catch (e) {
    listError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  // 60歳以上人口の年齢区分別推移（未実装だった candidate データセットを、
  // 「児童の年齢別人口」と同じ「年齢＋年度＋人数」形式のデータとみなして
  // 既存の normalizeAgeDistribution を再利用する）
  let seniorAgeDistribution = [];
  let seniorAgeInsights = null;
  let seniorAgeLatestPeriod = null;
  let seniorAgeYearlyTotals = [];
  let seniorAgeError = null;

  try {
    const seniorAgeData = await getDatasetRecords(datasets.seniorPopulationByAge.id);
    const normalized = normalizeAgeDistribution(seniorAgeData);
    if (normalized) {
      // 同じ部署（高齢者福祉課）が作成した「65歳以上人口推移」データセットは、
      // 年度表記が「12」「30」「元」のような和暦の数字のみで提供されており、
      // 汎用の日付列判定（DATE_FIELD_PATTERNS）では年度列として認識できないことが
      // わかっている（data/agingRatio.js 参照）。このデータセットも同じ部署・同じ
      // 「年度推移」形式のため、同様の理由で年度列を正しく検出できず、複数年度の
      // 行が1つの内訳に混ざってしまう可能性がある。年齢区分の重複が見つかった場合は、
      // 誤ったグラフを表示するより、エラー表示にして原典データセットに誘導する。
      const labels = normalized.distribution.map((d) => d.label);
      const hasDuplicateLabels = new Set(labels).size !== labels.length;
      if (hasDuplicateLabels) {
        seniorAgeError =
          "年度の判定に失敗し、複数年度のデータが混在する可能性があるため、表示を見合わせています。原典データセットをご確認ください。";
      } else {
        seniorAgeDistribution = normalized.distribution;
        seniorAgeLatestPeriod = normalized.latestPeriodLabel;
        seniorAgeYearlyTotals = normalized.yearlyTotals || [];
        seniorAgeInsights = buildAgeDistributionInsights(normalized);
      }
    } else {
      seniorAgeError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    seniorAgeError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: {
      series,
      statsInsights,
      statsError,
      fields,
      records,
      points,
      boundary,
      mapInsights,
      mapAvailable,
      facilityMapPoints,
      facilityMapStats,
      listError,
      agingRatioSeries: getAgingRatioSeries(),
      agingRatioInsights: buildAgingRatioInsights(),
      seniorAgeDistribution,
      seniorAgeInsights,
      seniorAgeLatestPeriod,
      seniorAgeYearlyTotals,
      seniorAgeError
    },
    revalidate: 60 * 60 * 24
  };
}

export default function SeniorHousing({
  series,
  statsInsights,
  statsError,
  fields,
  records,
  points,
  boundary,
  mapInsights,
  mapAvailable,
  facilityMapPoints,
  facilityMapStats,
  listError,
  agingRatioSeries,
  agingRatioInsights,
  seniorAgeDistribution,
  seniorAgeInsights,
  seniorAgeLatestPeriod,
  seniorAgeYearlyTotals,
  seniorAgeError
}) {
  const seniorAgeChartData = seniorAgeDistribution.map((d) => ({ label: `${d.label}歳`, count: d.value }));
  const seniorAgeYearlyChartData = seniorAgeYearlyTotals.map((d) => ({ label: d.label, count: d.total }));

  return (
    <>
      <Seo title={`高齢者向け住宅 ダッシュボード｜${siteConfig.name}`} description="船橋市のサービス付き高齢者向け住宅の入居者数の推移、市全体の高齢化率、60歳以上人口の年齢区分別の内訳を可視化したダッシュボードです。" path="/senior-housing" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">高齢者向け住宅 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.seniorHousingStats.label}」と「{datasets.seniorHousingList.label}」をもとに、
          サービス付き高齢者向け住宅の入居者数の推移と施設の分布を可視化しています。あわせて、市全体の高齢化率と、
          60歳以上人口の年齢区分別の内訳もご覧いただけます。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 生活保護の受給状況は、別途{" "}
          <a href="/welfare" className="underline hover:text-brass-dark">
            福祉ダッシュボード
          </a>
          でご覧いただけます。
        </p>

        {/* --- 入居者数の推移 --------------------------------------------- */}
        <div className="mt-10">
          <SectionLabel code="FIG.1">入居者数の推移（毎年10月1日時点）</SectionLabel>
          {statsError ? (
            <div className="border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{statsError}</p>
              <a
                href={datasets.seniorHousingStats.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                原典データセットを見る →
              </a>
            </div>
          ) : (
            <>
              {statsInsights ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="最新の入居者数"
                    value={statsInsights.latest.total.toLocaleString("ja-JP")}
                    unit="人"
                    delta={statsInsights.latest.label}
                    deltaLabel="時点"
                  />
                  <StatCard
                    label="前年比"
                    value={`${statsInsights.diff > 0 ? "+" : ""}${statsInsights.diff.toLocaleString("ja-JP")}`}
                    unit="人"
                    delta={
                      statsInsights.rate !== null
                        ? `${statsInsights.rate > 0 ? "+" : ""}${statsInsights.rate.toFixed(2)}%`
                        : null
                    }
                    deltaLabel="増減率"
                    tone={statsInsights.diff > 0 ? "up" : statsInsights.diff < 0 ? "down" : "neutral"}
                  />
                </div>
              ) : null}

              <div className="mt-6 border border-ink/10 bg-white/60 p-5">
                <ChartErrorBoundary>
                  <PopulationChart data={series} seriesLabel="入居者数" unit="人" periodLabel="年" />
                </ChartErrorBoundary>
              </div>

              {statsInsights ? (
                <div className="mt-6 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                  <p className="font-display text-base text-ink">読み解きメモ</p>
                  <p className="mt-2">
                    {statsInsights.latest.label}時点の入居者数は{statsInsights.latest.total.toLocaleString("ja-JP")}人で、
                    前年から
                    {statsInsights.diff >= 0 ? "増加" : "減少"}
                    （{statsInsights.diff > 0 ? "+" : ""}{statsInsights.diff.toLocaleString("ja-JP")}人）しました。
                    高齢化の進み方を直接示す数値ではありませんが、高齢者向けの住まいの需要動向を映す指標のひとつです。
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* --- 施設の分布 ------------------------------------------------- */}
        <div className="mt-14">
          <SectionLabel code="FIG.2">サービス付き高齢者向け住宅の分布</SectionLabel>
          {listError ? (
            <div className="border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{listError}</p>
              <a
                href={datasets.seniorHousingList.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                原典データセットを見る →
              </a>
            </div>
          ) : (
            <>
              {mapInsights ? (
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <StatCard label="登録件数" value={records.length.toLocaleString("ja-JP")} unit="件" />
                  <StatCard
                    label="最も件数が多い町丁目"
                    value={mapInsights.top.label}
                    delta={`${mapInsights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${mapInsights.topShare.toFixed(1)}%`}
                  />
                  <StatCard label="分布している町丁目数" value={mapInsights.areaCount.toLocaleString("ja-JP")} unit="町丁目" />
                </div>
              ) : null}

              {mapAvailable ? (
                <div className="border border-ink/10 bg-white/60 p-5">
                  <ChartErrorBoundary>
                    <TownBubbleMap points={points} boundary={boundary} unit="件" />
                  </ChartErrorBoundary>
                </div>
              ) : (
                <p className="text-sm text-ink-soft">
                  このデータセットには地図表示に十分な住所情報が含まれていなかったため、下記の一覧からご確認ください。
                </p>
              )}

              {facilityMapPoints.length > 0 && (
                <div className="mt-6 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="MAP">個別施設マップ（実地図）</SectionLabel>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    国土地理院の住所検索APIで座標化できた施設を、実際の地図上に表示しています。
                    ※このサイトの地図は簡易的なもので、実際の位置と多少ずれる場合があります。訪問前には施設に直接ご確認ください。
                  </p>
                  <div className="mt-4">
                    <InteractiveMap points={facilityMapPoints} enable3dBuildings showSidebar height={460} />
                  </div>
                  <p className="mt-3 text-xs text-ink-soft">
                    {facilityMapStats.total}件中{facilityMapStats.matched}件を地図に表示
                  </p>
                </div>
              )}

              <div className="mt-8">
                <SectionLabel code="TABLE">詳細一覧（補助・全件検索）</SectionLabel>
                <SearchableTable fields={fields} records={records} searchPlaceholder="施設名・住所で検索" />
              </div>
            </>
          )}
        </div>

        {/* --- 船橋市全体の高齢化率（65歳以上人口比率） ------------------- */}
        <div className="mt-14 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.AGE">船橋市全体の高齢化率（65歳以上人口比率）</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            上記のサ高住データは特定の住まい形態に限られるため、船橋市全体の高齢化の進み方を
            直接示すものではありません。船橋市オープンデータカタログには、この総人口比率
            （高齢化率）を年度別に収録した別のデータセットがあり、平成12年度から令和4年度まで
            23年分の推移が確認できます。
          </p>
          {agingRatioInsights ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="高齢化率（最新）"
                value={`${agingRatioInsights.latest.ratio}%`}
                delta={agingRatioInsights.latest.label}
                deltaLabel="時点"
              />
              <StatCard
                label="23年間の変化"
                value={`+${agingRatioInsights.longTermDiff}pt`}
                delta={`${agingRatioInsights.first.label}比`}
                deltaLabel="長期推移"
                tone="down"
              />
              <StatCard
                label="65歳以上人口（最新）"
                value={agingRatioInsights.latest.over65.toLocaleString("ja-JP")}
                unit="人"
                delta={`総人口 ${agingRatioInsights.latest.total.toLocaleString("ja-JP")}人中`}
                deltaLabel={agingRatioInsights.latest.label}
              />
            </div>
          ) : null}
          <div className="mt-6 border border-ink/10 bg-white/60 p-5">
            <ChartErrorBoundary>
              <PopulationChart data={agingRatioSeries} seriesLabel="高齢化率" unit="%" periodLabel="年度" />
            </ChartErrorBoundary>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
            船橋市の高齢化率は、平成12年度の12.3%から令和4年度には24.0%へと、23年間でちょうど
            2倍になりました。令和元年度から令和4年度にかけては23.9%〜24.0%とほぼ横ばいで、
            上昇のペースはやや落ち着いてきているようにも見えますが、今後も緩やかな上昇が
            続くと見込まれます。
          </p>
          <p className="mt-3 max-w-2xl text-xs text-ink-soft">
            出典：船橋市オープンデータカタログ「
            <a
              href="https://data.bodik.jp/dataset/122041_65saiijyoujinkousuii"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-brass-dark"
            >
              65歳以上人口推移
            </a>
            」（作成：高齢者福祉課）
          </p>
        </div>

        {/* --- 60歳以上人口の年齢区分別内訳 -------------------------------- */}
        <div className="mt-14 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.AGE2">60歳以上人口の年齢区分別内訳</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            高齢化率は「65歳以上が全体の何%か」という一つの数字ですが、実際には60代・70代・80代以上で
            状況は大きく異なります。船橋市オープンデータカタログの「{datasets.seniorPopulationByAge.label}」
            をもとに、60歳以上人口を年齢区分別に見てみます。
          </p>
          {seniorAgeError ? (
            <div className="mt-6 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{seniorAgeError}</p>
              <a
                href={datasets.seniorPopulationByAge.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                原典データセットを見る →
              </a>
            </div>
          ) : (
            <>
              {seniorAgeLatestPeriod ? (
                <p className="mb-4 mt-6 text-xs text-ink-soft">対象年度・時点：{seniorAgeLatestPeriod}</p>
              ) : null}

              {seniorAgeInsights ? (
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <StatCard label="60歳以上の合計人口" value={seniorAgeInsights.total.toLocaleString("ja-JP")} unit="人" />
                  <StatCard
                    label="最も人数が多い年齢区分"
                    value={seniorAgeInsights.top.label}
                    delta={`${seniorAgeInsights.top.value.toLocaleString("ja-JP")}人`}
                    deltaLabel={`全体の${seniorAgeInsights.topShare.toFixed(1)}%`}
                  />
                  <StatCard label="集計している区分の数" value={seniorAgeInsights.count.toLocaleString("ja-JP")} unit="区分" />
                </div>
              ) : null}

              <div className="border border-ink/10 bg-white/60 p-5">
                <p className="mb-3 text-xs text-ink-soft">年齢区分ごとの人口（{seniorAgeLatestPeriod || "最新年度"}）</p>
                <ChartErrorBoundary>
                  <CategoryBarChart data={seniorAgeChartData} unit="人" topN={20} />
                </ChartErrorBoundary>
              </div>

              {seniorAgeYearlyChartData.length > 1 ? (
                <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                  <p className="mb-3 text-xs text-ink-soft">60歳以上人口（合計）の年度推移</p>
                  <ChartErrorBoundary>
                    <PopulationChart data={seniorAgeYearlyChartData} seriesLabel="60歳以上人口" unit="人" periodLabel="年度" />
                  </ChartErrorBoundary>
                </div>
              ) : null}

              {seniorAgeInsights ? (
                <div className="mt-6 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                  <p className="font-display text-base text-ink">読み解きメモ</p>
                  <p className="mt-2">
                    {seniorAgeLatestPeriod ? `${seniorAgeLatestPeriod}時点で、` : ""}
                    60歳以上人口のうち、最も人数が多い年齢区分は{seniorAgeInsights.top.label}
                    で{seniorAgeInsights.top.value.toLocaleString("ja-JP")}人（60歳以上人口全体の
                    {seniorAgeInsights.topShare.toFixed(1)}%）でした。ひとくちに「高齢者」といっても、
                    年齢区分によって暮らし方や必要な支援は大きく異なります。上の「船橋市全体の高齢化率」と
                    あわせて見ることで、まちの高齢化の内訳がより立体的に見えてきます。
                  </p>
                </div>
              ) : null}

              <p className="mt-4 text-xs text-ink-soft">
                出典：船橋市オープンデータカタログ「
                <a
                  href={datasets.seniorPopulationByAge.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-brass-dark"
                >
                  {datasets.seniorPopulationByAge.label}
                </a>
                」
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          ※ 入居条件やサービス内容、空室状況などの最新情報は、各施設または船橋市の担当窓口に直接お問い合わせください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks articleHref="/articles/senior-housing-guide" articleLabel="サービス付き高齢者向け住宅から読み解く、船橋市の住まい事情" />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SENIOR} className="h-24" />
          </div>
      </section>
    </>
  );
}
