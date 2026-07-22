import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizePopulationSeries, buildAnnualSeriesInsights } from "../lib/bodik";
import {
  getFunabashiTownIndex,
  guessAddressField,
  aggregateByTown,
  buildDistributionInsights
} from "../lib/geo";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const TownBubbleMap = dynamic(() => import("../components/TownBubbleMap"), { ssr: false });

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
    }
  } catch (e) {
    listError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
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
      listError
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
  listError
}) {
  return (
    <>
      <Head>
        <title>{`高齢者向け住宅 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市のサービス付き高齢者向け住宅の入居者数の推移と、施設の分布を可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">高齢者向け住宅 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.seniorHousingStats.label}」と「{datasets.seniorHousingList.label}」をもとに、
          サービス付き高齢者向け住宅の入居者数の推移と施設の分布を可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ いわゆる「生活保護」の受給状況や、市全体の「高齢化率」を直接示すデータは、
          船橋市オープンデータカタログ上で見当たらなかったため、代わりに高齢者の住まいに関する
          データを可視化しています。該当データが公開されていることが確認できましたら追加します。
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

              <div className="mt-8">
                <SectionLabel code="TABLE">詳細一覧（補助・全件検索）</SectionLabel>
                <SearchableTable fields={fields} records={records} searchPlaceholder="施設名・住所で検索" />
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          ※ 入居条件やサービス内容、空室状況などの最新情報は、各施設または船橋市の担当窓口に直接お問い合わせください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SENIOR} className="h-24" />
        </div>
      </section>
    </>
  );
}
