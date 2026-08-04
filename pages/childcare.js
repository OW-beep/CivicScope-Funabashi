import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import SearchableTable from "../components/SearchableTable";
import { siteConfig, datasets } from "../data/siteConfig";
import {
  getDatasetRecords,
  normalizeChildcareCapacity,
  buildChildcareInsights,
  normalizePopulationSeries,
  buildAnnualSeriesInsights
} from "../lib/bodik";
import { guessNameField } from "../lib/geo";
import { geocodeRecordsToPoints, geocodeRecordsByNameOnly } from "../lib/geocode";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });
const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), { ssr: false });

export async function getStaticProps() {
  let series = [];
  let insights = null;
  let error = null;

  try {
    const data = await getDatasetRecords(datasets.childcareCapacity.id);
    const normalized = normalizeChildcareCapacity(data);
    if (normalized) {
      series = normalized.series;
      insights = buildChildcareInsights(normalized);
    } else {
      error = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  let temporaryCareSeries = [];
  let temporaryCareInsights = null;
  let temporaryCareError = null;
  try {
    const data = await getDatasetRecords(datasets.temporaryCare.id);
    const normalized = normalizePopulationSeries(data);
    if (normalized) {
      temporaryCareSeries = normalized.series;
      temporaryCareInsights = buildAnnualSeriesInsights(temporaryCareSeries, "total");
    } else {
      temporaryCareError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    temporaryCareError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  let sickChildcareSeries = [];
  let sickChildcareInsights = null;
  let sickChildcareError = null;
  try {
    const data = await getDatasetRecords(datasets.sickChildcare.id);
    const normalized = normalizePopulationSeries(data);
    if (normalized) {
      sickChildcareSeries = normalized.series;
      sickChildcareInsights = buildAnnualSeriesInsights(sickChildcareSeries, "total");
    } else {
      sickChildcareError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    sickChildcareError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  let facilityFields = [];
  let facilityRecords = [];
  let facilityError = null;
  try {
    const data = await getDatasetRecords(datasets.publicNurseryFacilities.id);
    if (data.fields.length && data.records.length) {
      facilityFields = data.fields;
      facilityRecords = data.records;
    } else {
      facilityError = "データを取得できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    facilityError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  // 公立保育所には住所欄が無く、施設名（例:「宮本第一保育園」）にも地名の手がかりが無いため、
  // 国土地理院の住所検索（住所専用）では座標化できない。代わりに、施設名でOpenStreetMapの
  // POIを検索できるNominatimを使う（詳細はlib/geocode.jsのコメント参照）。
  // GSIより一致率は下がりうるため、正直な内訳をmapStats/mapDebugに残す。
  const facilityNameField = guessNameField(facilityFields);

  let facilityMapPoints = [];
  let facilityMapStats = { matched: 0, total: 0 };
  let facilityMapDebug = null;
  try {
    const geo = await geocodeRecordsByNameOnly(facilityRecords, {
      nameField: facilityNameField,
      category: "公立保育所"
    });
    facilityMapPoints = geo.points;
    facilityMapStats = { matched: geo.matched, total: geo.total };
    // 一時的なデバッグ情報。地図に何も表示されない原因を切り分けるためのもの。
    facilityMapDebug = {
      note: "住所欄・地名の手がかりが無いため、施設名でNominatim(OSM)検索している",
      nameField: facilityNameField,
      fieldList: facilityFields,
      sampleRecord: facilityRecords[0] || null,
      unmatchedSample: geo.unmatchedAddresses.slice(0, 5),
      nominatimDebugSample: geo.debugSample
    };
  } catch (e) {
    facilityMapPoints = [];
    facilityMapStats = { matched: 0, total: 0 };
    facilityMapDebug = { error: String(e) };
  }

  return {
    props: {
      series,
      insights,
      error,
      temporaryCareSeries,
      temporaryCareInsights,
      temporaryCareError,
      sickChildcareSeries,
      sickChildcareInsights,
      sickChildcareError,
      facilityFields,
      facilityRecords,
      facilityError,
      facilityMapPoints,
      facilityMapStats,
      facilityMapDebug
    },
    revalidate: 60 * 60 * 24
  };
}

function fmt(n) {
  return n === null || n === undefined ? "―" : n.toLocaleString("ja-JP");
}

export default function Childcare({
  series,
  insights,
  error,
  temporaryCareSeries,
  temporaryCareInsights,
  temporaryCareError,
  sickChildcareSeries,
  sickChildcareInsights,
  sickChildcareError,
  facilityFields,
  facilityRecords,
  facilityError,
  facilityMapPoints,
  facilityMapStats,
  facilityMapDebug
}) {
  const capacitySeries = series.map((s) => ({ label: s.label, total: s.total.capacity, enrolled: s.total.enrolled }));
  const enrolledSeries = series.map((s) => ({ label: s.label, total: s.total.enrolled }));
  const waitingSeries = series.map((s) => ({ label: s.label, total: s.total.waiting }));

  const latestFacilities = insights
    ? Object.entries(insights.latest.categories).map(([label, v]) => ({ label, count: v.facilities }))
    : [];
  const latestWaiting = insights
    ? Object.entries(insights.latest.categories)
        .map(([label, v]) => ({ label, count: v.waiting }))
        .filter((row) => row.count > 0)
    : [];

  return (
    <>
      <Seo title={`保育園 ダッシュボード｜${siteConfig.name}`} description="船橋市の保育施設（保育所・認定こども園・小規模保育事業など）の定員数・入所児童数・待機数の推移を可視化したダッシュボードです。" path="/childcare" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">保育園 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.childcareCapacity.label}」をもとに、
          {datasets.childcareCapacity.description}
          保育所（公立・民間）・認定こども園・小規模保育事業・事業所内保育事業の5区分を収録しています。
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a
              href={datasets.childcareCapacity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block underline"
            >
              原典データセットを見る →
            </a>
          </div>
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="定員数（合計・最新）"
                  value={fmt(insights.latest.total.capacity)}
                  unit="人"
                  delta={insights.latest.label}
                  deltaLabel="時点"
                />
                <StatCard
                  label="入所児童数（合計・最新）"
                  value={fmt(insights.latest.total.enrolled)}
                  unit="人"
                  delta={`${insights.enrolledDiff > 0 ? "+" : ""}${fmt(insights.enrolledDiff)}`}
                  deltaLabel="前年度比"
                  tone={insights.enrolledDiff > 0 ? "up" : insights.enrolledDiff < 0 ? "down" : "neutral"}
                />
                <StatCard
                  label="待機数（合計・最新）"
                  value={fmt(insights.latest.total.waiting)}
                  unit="人"
                  delta={`${insights.waitingDiff > 0 ? "+" : ""}${fmt(insights.waitingDiff)}`}
                  deltaLabel="前年度比"
                  tone={insights.waitingDiff > 0 ? "down" : insights.waitingDiff < 0 ? "up" : "neutral"}
                />
                <StatCard
                  label="施設数（合計・最新）"
                  value={fmt(insights.latest.total.facilities)}
                  unit="施設"
                  delta={`5年で${insights.facilitiesLongTermDiff > 0 ? "+" : ""}${fmt(insights.facilitiesLongTermDiff)}`}
                  deltaLabel="長期推移"
                />
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">定員数・入所児童数の推移（合計）</SectionLabel>
              <ChartErrorBoundary>
                <PopulationChart data={capacitySeries} seriesLabel="定員数" unit="人" periodLabel="年度" />
              </ChartErrorBoundary>
              <p className="mt-3 text-xs text-ink-soft">
                「定員数」は保育施設が受け入れ可能な人数、「入所児童数」は実際に入所している児童数です。
              </p>
            </div>

            <div className="mt-8 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.2">待機数の推移（合計）</SectionLabel>
              <ChartErrorBoundary>
                <PopulationChart data={waitingSeries} seriesLabel="待機数" unit="人" periodLabel="年度" />
              </ChartErrorBoundary>
            </div>

            {latestFacilities.length ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.3">{`区分別 施設数（${insights.latest.label}）`}</SectionLabel>
                <ChartErrorBoundary>
                  <CategoryBarChart data={latestFacilities} unit="施設" topN={5} />
                </ChartErrorBoundary>
              </div>
            ) : null}

            {latestWaiting.length ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.4">{`区分別 待機数（${insights.latest.label}）`}</SectionLabel>
                <ChartErrorBoundary>
                  <CategoryBarChart data={latestWaiting} unit="人" topN={5} />
                </ChartErrorBoundary>
              </div>
            ) : null}

            {insights ? (
              <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  {insights.latest.label}時点の保育施設の定員数は{fmt(insights.latest.total.capacity)}人、
                  入所児童数は{fmt(insights.latest.total.enrolled)}人でした。定員数と入所児童数の差
                  （{fmt(insights.latest.total.capacity - insights.latest.total.enrolled)}人）がそのまま
                  「空き」を意味するわけではありません。年齢区分や地域によって定員に空きがあっても、
                  希望する園に入れない「待機」が生じることがあります。
                </p>
                <p className="mt-3">
                  待機数（合計）は{insights.first.label}の{fmt(insights.first.total.waiting)}人から
                  {insights.latest.label}の{fmt(insights.latest.total.waiting)}人へと、
                  {insights.waitingLongTermDiff >= 0 ? "増加" : "減少"}しています
                  （{insights.waitingLongTermDiff > 0 ? "+" : ""}{fmt(insights.waitingLongTermDiff)}人）。
                  区分別に見ると、施設数の多い「保育所（民間）」が待機数でも大きな割合を占める傾向にあります。
                </p>
                <p className="mt-3">
                  なお、本データの「待機数」は船橋市の集計基準によるものです。国が毎年公表する
                  「待機児童数」は、育児休業中のケースなどを除いた別の基準で算出されており、本データとは
                  数字が一致しません。正確な最新の待機児童数は、船橋市保育入園課の発表資料をご確認ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        {/* --- 一時預かり利用状況 ------------------------------------------ */}
        <div className="mt-14 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.5">一時預かり利用状況の推移</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            保護者の通院・リフレッシュなどの際に一時的に子どもを預けられる「一時預かり事業」の、
            年間利用者数の推移です（{datasets.temporaryCare.description}）。
          </p>
          {temporaryCareError ? (
            <div className="mt-4 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{temporaryCareError}</p>
            </div>
          ) : (
            <>
              {temporaryCareInsights ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="年間利用者数（最新）"
                    value={fmt(temporaryCareInsights.latest.total)}
                    unit="人"
                    delta={temporaryCareInsights.latest.label}
                    deltaLabel="時点"
                  />
                  <StatCard
                    label="前年度比"
                    value={`${temporaryCareInsights.diff > 0 ? "+" : ""}${fmt(temporaryCareInsights.diff)}`}
                    unit="人"
                    delta={
                      temporaryCareInsights.rate !== null
                        ? `${temporaryCareInsights.rate > 0 ? "+" : ""}${temporaryCareInsights.rate.toFixed(1)}%`
                        : null
                    }
                    deltaLabel="増減率"
                    tone={temporaryCareInsights.diff > 0 ? "up" : temporaryCareInsights.diff < 0 ? "down" : "neutral"}
                  />
                </div>
              ) : null}
              <div className="mt-6 border border-ink/10 bg-white/60 p-5">
                <ChartErrorBoundary>
                  <PopulationChart data={temporaryCareSeries} seriesLabel="利用者数" unit="人" periodLabel="年度" />
                </ChartErrorBoundary>
              </div>
              <p className="mt-3 text-xs text-ink-soft">
                令和2年度に利用者数が大きく落ち込んでいるのは、新型コロナウイルス感染症拡大の影響が
                考えられます。
              </p>
            </>
          )}
        </div>

        {/* --- 病児保育利用者数 ------------------------------------------- */}
        <div className="mt-14">
          <SectionLabel code="FIG.6">病児保育利用者数の推移</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            子どもが病気の際に一時的に預かる「病児保育」の、年間利用者数の推移です（
            {datasets.sickChildcare.description}）。
          </p>
          {sickChildcareError ? (
            <div className="mt-4 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{sickChildcareError}</p>
            </div>
          ) : (
            <>
              {sickChildcareInsights ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="年間利用者数（最新）"
                    value={fmt(sickChildcareInsights.latest.total)}
                    unit="人"
                    delta={sickChildcareInsights.latest.label}
                    deltaLabel="時点"
                  />
                  <StatCard
                    label="前年度比"
                    value={`${sickChildcareInsights.diff > 0 ? "+" : ""}${fmt(sickChildcareInsights.diff)}`}
                    unit="人"
                    delta={
                      sickChildcareInsights.rate !== null
                        ? `${sickChildcareInsights.rate > 0 ? "+" : ""}${sickChildcareInsights.rate.toFixed(1)}%`
                        : null
                    }
                    deltaLabel="増減率"
                    tone={sickChildcareInsights.diff > 0 ? "up" : sickChildcareInsights.diff < 0 ? "down" : "neutral"}
                  />
                </div>
              ) : null}
              <div className="mt-6 border border-ink/10 bg-white/60 p-5">
                <ChartErrorBoundary>
                  <PopulationChart data={sickChildcareSeries} seriesLabel="利用者数" unit="人" periodLabel="年度" />
                </ChartErrorBoundary>
              </div>
            </>
          )}
        </div>

        {/* --- 公立保育所マップ ------------------------------------------- */}
        {facilityMapPoints.length === 0 && facilityMapDebug && (
          <div className="mt-14 border border-dashed border-brass/50 bg-brass/5 p-4 text-xs text-ink-soft">
            <p className="font-mono text-brass-dark">
              [DEBUG] 地図に表示できる座標が見つかりませんでした。以下の情報を貼ってもらえれば原因を切り分けられます（見つかったら、この枠は削除します）。
            </p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(facilityMapDebug, null, 2)}</pre>
          </div>
        )}

        {facilityMapPoints.length > 0 && (
          <div className="mt-14 border border-ink/10 bg-white/60 p-5">
            <SectionLabel code="MAP">公立保育所マップ（実地図・3D建物表示）</SectionLabel>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              施設名でOpenStreetMap（Nominatim）を検索して座標化できた公立保育所を、実際の地図上に
              表示しています。このデータセットには住所欄が無いため施設名だけを頼りに検索しており、
              国土地理院の住所検索より一致率が低く、位置がずれる場合がある点はご留意ください。
              ※このサイトの地図は簡易的なもので、実際の位置と多少ずれる場合があります。訪問前には各施設の情報を原典データでご確認ください。
            </p>
            <div className="mt-4">
              <InteractiveMap points={facilityMapPoints} enable3dBuildings showSidebar height={460} />
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              {facilityMapStats.total}箇所中{facilityMapStats.matched}箇所を地図に表示（住所から座標を特定できたもののみ）
            </p>
          </div>
        )}

        {/* --- 公立保育所一覧 --------------------------------------------- */}
        <div className="mt-14">
          <SectionLabel code="TABLE">公立保育所一覧（施設詳細）</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            市内27の公立保育所について、定員・建物構造・敷地面積・延床面積・増改築の履歴を一覧できます。
          </p>
          {facilityError ? (
            <div className="mt-4 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{facilityError}</p>
            </div>
          ) : (
            <div className="mt-6">
              <SearchableTable fields={facilityFields} records={facilityRecords} searchPlaceholder="保育所名で検索" />
            </div>
          )}
        </div>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/childcare-guide"
            articleLabel="船橋市の保育園、定員は増えているのに待機も増えている理由"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHILDCARE} className="h-24" />
        </div>
      </section>
    </>
  );
}
