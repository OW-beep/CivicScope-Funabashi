import dynamic from "next/dynamic";
import Seo from "../components/Seo";
import SectionLabel from "../components/SectionLabel";
import AdSlot from "../components/AdSlot";
import { siteConfig } from "../data/siteConfig";
import { combineByStationName } from "../data/railRidership";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const AreaMapIllustration = dynamic(() => import("../components/AreaMapIllustration"), { ssr: false });

export async function getStaticProps() {
  const combined = combineByStationName(40);
  const byName = Object.fromEntries(combined.map((c) => [c.label, c.count]));

  // 駅の座標は実際の緯度経度（各駅の公開情報をもとに設定）。
  // マーカーの大きさだけでなく、位置そのものも実際の地理関係を反映している。
  const stations = [
    { name: "北習志野", lat: 35.7212, lng: 140.0426, count: byName["北習志野"] || 0 },
    { name: "西船橋", lat: 35.7078, lng: 139.9589, count: byName["西船橋"] || 0 },
    { name: "南船橋", lat: 35.6825, lng: 139.9945, count: byName["南船橋"] || 0 }
  ];

  let boundary = [];
  try {
    boundary = await getFunabashiBoundaryRings();
  } catch (e) {
    boundary = [];
  }

  return { props: { stations, boundary } };
}

const AREAS = [
  {
    title: "船橋駅・西船橋駅エリア",
    tagline: "都心近接 × 商業集積",
    href: "/articles/area-guide-central-funabashi",
    color: "border-brass/50"
  },
  {
    title: "北習志野・習志野台エリア",
    tagline: "新京成沿線 × 住宅地",
    href: "/articles/area-guide-north-narashinodai",
    color: "border-bay/50"
  },
  {
    title: "南船橋・湾岸エリア",
    tagline: "商業施設 × 三番瀬",
    href: "/articles/area-guide-minamifunabashi-coast",
    color: "border-ink/30"
  }
];

export default function AreaMap({ stations, boundary }) {
  return (
    <>
      <Seo
        title={`船橋市 エリアマップ｜${siteConfig.name}`}
        description="船橋市の実際の行政境界と、3つのエリア（中心市街地・北習志野住宅地・湾岸）を、実際の鉄道乗車人員データをもとにした地図で紹介します。"
        path="/area-map"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Area Map</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市 エリアマップ</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市の実際の行政境界と駅の位置関係をもとに、市内を3つのエリアに分けて紹介します。
          駅の丸の大きさは、
          <a href="/rail-ridership" className="underline hover:text-brass-dark">
            実際の1日平均乗車人員データ
          </a>
          に基づいています（西船橋は3社合算）。
        </p>

        <div className="mt-10 border border-ink/10 bg-white/40 p-4 sm:p-8">
          <AreaMapIllustration stations={stations} boundary={boundary} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {AREAS.map((area) => (
            <a
              key={area.href}
              href={area.href}
              className={`group flex flex-col border-2 ${area.color} bg-white/50 p-5 transition-colors hover:bg-white/80`}
            >
              <span className="font-mono text-xs text-ink-soft">{area.tagline}</span>
              <h3 className="mt-2 font-display text-lg text-ink group-hover:text-brass-dark">{area.title}</h3>
              <span className="mt-3 text-xs font-mono text-ink-soft">詳しく読む →</span>
            </a>
          ))}
        </div>

        <div className="mt-12 border-t border-ink/10 pt-8">
          <SectionLabel code="NOTE">この地図について</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            背景の輪郭は、国土数値情報（国土交通省）をもとにした船橋市の実際の行政境界です。
            3駅（北習志野・西船橋・南船橋）の位置も、実際の緯度経度をもとに正しい位置関係で
            配置しています。一方、駅を中心にした3つの色付きの円（エリア分け）は船橋市の公式な
            地区界ではなく、このサイトが便宜的に設定した目安の範囲です。梨の木のアイコンは
            北部エリアに残る農地の風景を、波のアイコンは湾岸エリアの三番瀬をイメージした装飾です。
            駅マーカーの大きさは、実データ（鉄道駅別乗車人員ダッシュボード）に基づいた正確な比率です。
          </p>
        </div>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_AREAMAP} className="h-24" />
        </div>
      </section>
    </>
  );
}
