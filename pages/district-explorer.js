import dynamic from "next/dynamic";
import Seo from "../components/Seo";
import SectionLabel from "../components/SectionLabel";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import AdSlot from "../components/AdSlot";
import DataUnavailableNotice from "../components/DataUnavailableNotice";
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

  // 【CivicScope船橋の独自集計】「人口1,000人あたりの施設数」ランキング。
  // 単純な施設数の合計は、人口が多い町丁目ほど有利になりがちなため、e-Statの人口データで
  // 割って「人口あたりの施設充実度」に換算している。他のどのサイト・統計にも無い、
  // 本サイト独自の合成指標であることを明記する（重み付けの根拠：5カテゴリを均等に1件=1点として
  // 合算しているだけで、カテゴリ間の重要度に差はつけていない）。
  // 人口データが無い（e-Stat未接続、または秘匿値の）町丁目はランキング対象から除外する
  // （無理に0人として計算すると、実態と違う極端な数値になってしまうため）。
  const livabilityRanking = districts
    .filter((d) => d.population && d.population > 0)
    .map((d) => ({
      label: d.label,
      population: d.population,
      facilityCount: d.count,
      perThousand: Math.round((d.count / d.population) * 1000 * 10) / 10
    }))
    .sort((a, b) => b.perThousand - a.perThousand);

  return { props: { districts, boundary, error, livabilityRanking }, revalidate: 60 * 60 * 24 };
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

export default function DistrictExplorer({ districts, boundary, error, livabilityRanking }) {
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
          件数内訳がパネルに表示されます。円の大きさは合計件数に比例します。町丁目ごとの暮らしやすさを
          比べたい方や、引っ越し先の候補エリアを絞り込みたい方にお使いいただけます。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 人口・世帯数はe-Stat（政府統計の総合窓口）の国勢調査・小地域集計から取得しています
          （5年に1度の調査のため、市の毎月人口統計より更新頻度は落ちます。また、人口・世帯数が
          少ない町丁目は秘匿されており、表示されない場合があります）。施設については、住所の
          書き方のゆれにより、実際より少なく数えられている可能性があります。
        </p>

        {error ? (
          <DataUnavailableNotice message={error} />
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

        {/* --- CivicScope船橋 独自集計：施設充実度ランキング --------------------- */}
        {livabilityRanking.length > 0 && (
          <div className="mt-10 border border-ink/10 bg-white/60 p-5">
            <SectionLabel code="RANK">町丁目別 施設充実度ランキング（CivicScope船橋 独自集計）</SectionLabel>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              広場・公園・保育所・生活衛生施設・食品営業施設の合計件数を、その町丁目の人口で割り、
              「人口1,000人あたりの施設数」に換算したランキングです。単純な件数の合計は人口が多い
              町丁目ほど有利になりやすいため、人口あたりに直すことで、規模の違う町丁目同士でも
              比較できるようにしています。5カテゴリは重要度を区別せず均等に1件＝1点として
              合算した、本サイト独自の指標です（他の統計・サイトには無い集計です）。
            </p>
            <div className="mt-4 overflow-x-auto border border-ink/10">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="whitespace-nowrap px-3 py-2 font-normal">順位</th>
                    <th className="whitespace-nowrap px-3 py-2 font-normal">町丁目</th>
                    <th className="whitespace-nowrap px-3 py-2 font-normal">人口1,000人あたり施設数</th>
                    <th className="whitespace-nowrap px-3 py-2 font-normal">人口</th>
                  </tr>
                </thead>
                <tbody>
                  {livabilityRanking.slice(0, 10).map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white/70" : "bg-paper-dark/40"}>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-ink-soft">{i + 1}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{row.label}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{row.perThousand}件</td>
                      <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{row.population.toLocaleString("ja-JP")}人</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              対象：人口データが確認できた{livabilityRanking.length}町丁目中の上位10件
            </p>
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
