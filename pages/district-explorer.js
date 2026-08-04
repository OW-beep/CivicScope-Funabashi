import dynamic from "next/dynamic";
import Seo from "../components/Seo";
import SectionLabel from "../components/SectionLabel";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import AdSlot from "../components/AdSlot";
import { siteConfig, datasets } from "../data/siteConfig";
import { buildDistrictStats, DISTRICT_METRICS } from "../lib/districtStats";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const TownBubbleMap = dynamic(() => import("../components/TownBubbleMap"), { ssr: false });

export async function getStaticProps() {
  let districts = [];
  let error = null;
  try {
    districts = await buildDistrictStats(datasets);
  } catch (e) {
    error = "地区データの集計に失敗しました。しばらくしてから再度お試しください。";
  }

  let boundary = [];
  try {
    boundary = await getFunabashiBoundaryRings();
  } catch (e) {
    boundary = [];
  }

  return { props: { districts, boundary, error }, revalidate: 60 * 60 * 24 };
}

function DistrictDetail({ active }) {
  const maxCount = Math.max(...active.breakdown.map((b) => b.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-display text-ink">{active.label}</span>
        <span className="font-mono text-brass-dark">{active.count.toLocaleString("ja-JP")}件（合計）</span>
      </div>

      {(active.population != null || active.households != null) && (
        <div className="mt-2 flex gap-4 text-xs text-ink-soft">
          {active.population != null && (
            <span>
              人口 <span className="font-mono text-ink">{active.population.toLocaleString("ja-JP")}</span>人
            </span>
          )}
          {active.households != null && (
            <span>
              世帯数 <span className="font-mono text-ink">{active.households.toLocaleString("ja-JP")}</span>世帯
            </span>
          )}
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {active.breakdown.map((b) => (
          <div key={b.key} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-xs text-ink-soft">{b.label}</span>
            <div className="h-3 flex-1 bg-paper-dark/40">
              <div className="h-3" style={{ width: `${(b.count / maxCount) * 100}%`, backgroundColor: b.color }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-xs text-ink">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DistrictExplorer({ districts, boundary, error }) {
  return (
    <>
      <Seo
        title={`地区マップ｜${siteConfig.name}`}
        description="船橋市内の町丁目ごとに、広場・公園・保育所などの施設分布をクリックして確認できる地区マップです。"
        path="/district-explorer"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">地区マップ（試験提供）</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          町丁目の円をクリックすると、その地区にある広場・公園・保育所・生活衛生施設・食品営業施設の
          件数内訳がパネルに表示されます。円の大きさは合計件数に比例します。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 人口・世帯数はe-Stat（政府統計の総合窓口）の国勢調査・小地域集計から取得しています
          （5年に1度の調査のため、市の毎月人口統計より更新頻度は落ちます。また、人口・世帯数が
          少ない町丁目は秘匿されており、表示されない場合があります）。施設については、住所の
          書き方のゆれにより、実際より少なく数えられている可能性があります。
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
          </div>
        ) : districts.length ? (
          <div className="mt-10 border border-ink/10 bg-white/60 p-5">
            <SectionLabel code="MAP">町丁目別 施設分布</SectionLabel>
            <TownBubbleMap points={districts} boundary={boundary} unit="件" renderDetail={(active) => <DistrictDetail active={active} />} />
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
              {DISTRICT_METRICS.map((m) => (
                <span key={m.key} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 border border-ink/10 bg-white/60 p-5 text-sm text-ink-soft">
            表示できる地区データがありませんでした。
          </div>
        )}

        <div className="mt-10">
          <DashboardFooterLinks />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_AREA_MAP} className="h-24" />
        </div>
      </section>
    </>
  );
}
