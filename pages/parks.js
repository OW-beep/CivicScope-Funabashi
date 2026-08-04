import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords } from "../lib/bodik";
import { loadGeocodedPoints } from "../lib/geocodedCache";
import { plazaSummary } from "../data/parks";

const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), { ssr: false });

const MAP_CATEGORY_COLORS = { 広場: "#2F6F6E", 公園: "#B8862F" };

export async function getStaticProps() {
  let plazaFields = [];
  let plazaRecords = [];
  let plazaError = null;
  try {
    const data = await getDatasetRecords(datasets.plazas.id);
    if (data.fields.length && data.records.length) {
      plazaFields = data.fields;
      plazaRecords = data.records;
    } else {
      plazaError = "データを取得できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    plazaError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  let parkFields = [];
  let parkRecords = [];
  let parkError = null;
  try {
    const data = await getDatasetRecords(datasets.featuredParks.id);
    if (data.fields.length && data.records.length) {
      parkFields = data.fields;
      parkRecords = data.records;
    } else {
      parkError = "データを取得できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    parkError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  // 広場・公園の座標は、ビルド時にその場で座標化するのではなく、
  // scripts/geocode-facilities.js を手元で事前実行して作った
  // data/geocoded/*.json をここで読むだけにしている。
  // （ビルド時にGSI/Nominatimへ都度アクセスすると、Vercelの静的ページ生成の
  // 60秒タイムアウトを超えてビルドが失敗するため。詳しい経緯はそのスクリプトの
  // コメントを参照）
  const plazaPoints = loadGeocodedPoints("plazas");
  const parkPoints = loadGeocodedPoints("featuredParks");
  const mapPoints = [...plazaPoints, ...parkPoints];
  const mapStats = {
    matched: mapPoints.length,
    total: plazaRecords.length + parkRecords.length
  };

  return {
    props: {
      plazaFields,
      plazaRecords,
      plazaError,
      parkFields,
      parkRecords,
      parkError,
      mapPoints,
      mapStats
    },
    revalidate: 60 * 60 * 24
  };
}

export default function Parks({
  plazaFields,
  plazaRecords,
  plazaError,
  parkFields,
  parkRecords,
  parkError,
  mapPoints,
  mapStats
}) {
  return (
    <>
      <Seo
        title={`公園・広場 ダッシュボード｜${siteConfig.name}`}
        description="船橋市内の小規模な広場と特色のある公園の一覧を検索できるダッシュボードです。"
        path="/parks"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">公園・広場 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログ「{datasets.plazas.label}」「{datasets.featuredParks.label}」
          （いずれも"いきいきふれあいマップ"掲載データ、作成：公園緑地課）をもとに、市内の身近な
          広場・公園を検索できるようにしています。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="広場の数" value={plazaSummary.count.toLocaleString("ja-JP")} unit="箇所" />
          <StatCard
            label="広場の合計面積"
            value={Math.round(plazaSummary.totalAreaM2).toLocaleString("ja-JP")}
            unit="m²"
            delta={`テニスコート約${Math.round(plazaSummary.totalAreaM2 / 260)}面分`}
            deltaLabel="目安"
          />
          <StatCard
            label="遊具ありの広場"
            value={plazaSummary.withEquipment.toLocaleString("ja-JP")}
            unit="箇所"
            delta={`全体の${((plazaSummary.withEquipment / plazaSummary.count) * 100).toFixed(0)}%`}
            deltaLabel="割合"
          />
          <StatCard
            label="一番古い広場"
            value={`${plazaSummary.oldest.year}年`}
            delta={plazaSummary.oldest.name}
            deltaLabel="開設"
          />
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">広場の開設年代別の内訳</SectionLabel>
          <div className="mt-4 space-y-2">
            {plazaSummary.byDecade.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-xs text-ink-soft">{row.label}</span>
                <div className="h-4 flex-1 bg-paper-dark/40">
                  <div
                    className="h-4 bg-brass/70"
                    style={{ width: `${(row.count / 33) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-ink">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            開設年代を見ると、1980年代に整備された広場が33箇所ともっとも多く、全体の4分の1以上を
            占めています。宅地開発が進んだ時期と重なっており、当時の街づくりの中で身近な遊び場が
            数多く生まれたことがうかがえます。近年（2020年代）も新しい広場が整備され続けており、
            直近では令和7年12月にも2箇所が開設されています。
          </p>
        </div>

        {mapPoints.length === 0 && (
          <div className="mt-10 border border-ink/10 bg-white/60 p-5 text-sm text-ink-soft">
            まだ地図データがありません。<code>node scripts/geocode-facilities.js</code> を実行して座標化してください。
          </div>
        )}

        {mapPoints.length > 0 && (
          <div className="mt-10 border border-ink/10 bg-white/60 p-5">
            <SectionLabel code="MAP.1">広場・公園マップ（実地図）</SectionLabel>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              広場は名称に含まれる町丁目名を国土地理院の住所検索APIで座標化しています（住所欄が無い
              ため、ピンの位置は広場そのものの正確な地点ではなく町丁目レベルのおおよその位置です）。
              公園は住所・地名の手がかりが無いため、施設名でOpenStreetMap（Nominatim）を検索して
              座標化しています（GSIの住所検索より一致率・精度は落ちる場合があります）。
              いずれも座標が見つからなかった施設は、下の一覧では引き続き確認できます。
              ※このサイトの地図は簡易的なもので、実際の位置と多少ずれる場合があります。訪問前には各施設の情報を原典データでご確認ください。
            </p>
            <div className="mt-4">
              <InteractiveMap
                points={mapPoints}
                categoryColors={MAP_CATEGORY_COLORS}
                enable3dBuildings
                showSidebar
                height={460}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MAP_CATEGORY_COLORS["広場"] }} />
                広場（町丁目レベルの概算位置）
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MAP_CATEGORY_COLORS["公園"] }} />
                公園（Nominatim検索、ずれる場合あり）
              </span>
              <span>
                {mapStats.total}箇所中{mapStats.matched}箇所を地図に表示
              </span>
            </div>
          </div>
        )}


        <div className="mt-10">
          <SectionLabel code="TABLE.1">{`広場 一覧（${plazaSummary.count}箇所、検索可）`}</SectionLabel>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            町丁目の名前を入れて、近くの広場を探すのに便利です。多くは遊具・トイレのない、
            ごく身近な小さな遊び場です。
          </p>
          {plazaError ? (
            <div className="mt-4 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{plazaError}</p>
            </div>
          ) : (
            <div className="mt-4">
              <SearchableTable fields={plazaFields} records={plazaRecords} searchPlaceholder="施設名称・地名で検索" />
            </div>
          )}
        </div>

        <div className="mt-14">
          <SectionLabel code="TABLE.2">特色のある公園 一覧（検索可）</SectionLabel>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            遊具やスポーツ施設が充実した、比較的規模の大きい公園の一覧です。テニスコートや野球場
            などの運動施設の有無も確認できます。
          </p>
          {parkError ? (
            <div className="mt-4 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{parkError}</p>
            </div>
          ) : (
            <div className="mt-4">
              <SearchableTable fields={parkFields} records={parkRecords} searchPlaceholder="施設名称で検索" />
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          ※ 遊具の設置状況やトイレの有無などは変更されている場合があります。最新の状況は現地または
          船橋市公園緑地課にご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/parks-guide"
            articleLabel="船橋市には広場が122箇所。身近な遊び場をデータで見る"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PARKS} className="h-24" />
        </div>
      </section>
    </>
  );
}
