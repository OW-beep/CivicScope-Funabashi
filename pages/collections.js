import Seo from "../components/Seo";
import Link from "next/link";
import { siteConfig } from "../data/siteConfig";
import { getArticleBySlug } from "../data/articles";
import ArticleThumbnail from "../components/ArticleThumbnail";

// 目的別の読み方コレクション。タグ別一覧とは別の切り口で、読者が「自分の目的に近い記事」を
// まとめて見つけられるようにするためのページ。単なるリンク集にならないよう、各コレクションには
// このページ独自の解説文（船橋市の実情に触れた導入）を書いている。
const COLLECTIONS = [
  {
    key: "moving",
    title: "引っ越し・住まい探しの方へ",
    description:
      "船橋市は同じ市内でも、駅からの近さや沿線によって暮らしの雰囲気がかなり変わります。船橋駅・西船橋駅周辺は商業施設が集積した都心近接エリア、北習志野・習志野台は新京成沿線の落ち着いた住宅地、南船橋・湾岸は大型商業施設と三番瀬の自然が近いエリアです。地価は沿線ごとに数十万円単位で差があり、人口はこの数年で65万人を超えるペースで増え続けています。「駅・地価・まちの雰囲気」を数字とあわせて確認したい方は、下記の記事から読んでみてください。",
    slugs: [
      "why-funabashi-charm-guide",
      "area-guide-central-funabashi",
      "area-guide-north-narashinodai",
      "area-guide-minamifunabashi-coast",
      "land-price-by-railway-line-guide",
      "population-650k-milestone-guide"
    ]
  },
  {
    key: "childrearing",
    title: "子育て中・これから子育てする方へ",
    description:
      "子育て環境は「保育園に入れるか」だけでは判断できません。保育の定員・待機状況、学校（生徒数の推移）、公園の数、学校給食の負担、図書館の利用状況など、複数のデータを横断して見ることで、初めて実態に近づきます。船橋市は少子化と宅地開発が同時に進んでいるため、地区によって子育て環境の実感がかなり異なるのも特徴です。以下の記事では、船橋市が「子育てしやすいまちか」を、データを起点に多面的に確認できます。",
    slugs: [
      "is-funabashi-good-for-child-rearing",
      "childcare-guide",
      "fertility-and-aging-guide",
      "school-lunch-fee-free-guide",
      "parks-guide",
      "library-collection-usage-guide"
    ]
  },
  {
    key: "safety",
    title: "防災・安全が気になる方へ",
    description:
      "「安全なまちかどうか」は感覚だけでは判断しづらいテーマです。避難場所・避難所の位置、刑法犯認知件数や救急出動件数の推移、特殊詐欺の被害件数、火災の発生件数と発生しやすい時期など、船橋市が公開している一次データをもとに、実際の傾向を確認できる記事をまとめました。防災グッズを揃える前に、まず自分の住むエリアの避難場所を確認しておくことをおすすめします。",
    slugs: [
      "evacuation-map-guide",
      "public-safety-dashboard-guide",
      "phone-fraud-damage-guide",
      "fire-statistics-guide",
      "traffic-accident-trend-guide"
    ]
  },
  {
    key: "culture",
    title: "船橋の暮らし・文化を知りたい方へ",
    description:
      "船橋市は「東京の隣のベッドタウン」というイメージが強いかもしれませんが、実際には梨の生産量が全国でも上位に入り、東京湾に面した三番瀬では今も漁業が営まれ、ホタルが見られる場所も残っています。町会・自治会の加入状況を見ると、地域によってコミュニティの結びつきの強さにも差があります。統計データだけでは見えにくい、船橋という土地の個性に触れたい方向けの記事です。",
    slugs: [
      "funabashi-nashi-pears-guide",
      "funabashi-agriculture-output-guide",
      "funabashi-fishery-guide",
      "sanbanze-tidal-flat-guide",
      "funabashi-firefly-viewing-guide",
      "chokai-directory-guide"
    ]
  }
];

export default function Collections() {
  return (
    <>
      <Seo
        title={`目的別の読み方ガイド｜${siteConfig.name}`}
        description="引っ越し検討中、子育て中、防災が気になる方など、目的別にCivicScope船橋の記事をまとめました。"
        path="/collections"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Collections</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">目的別の読み方ガイド</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          55本の記事の中から、目的に応じて読むと理解が深まる組み合わせをまとめました。単に記事を並べるのではなく、
          それぞれのテーマについて船橋市の実情を踏まえた解説を添えています。
          タグ別の一覧は<Link href="/articles" className="underline hover:text-brass-dark">解説記事一覧</Link>からもご覧いただけます。
        </p>

        <div className="mt-10 space-y-14">
          {COLLECTIONS.map((c) => {
            const articles = c.slugs.map((s) => getArticleBySlug(s)).filter(Boolean);
            return (
              <div key={c.key}>
                <h2 className="font-display text-xl text-ink">{c.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{c.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {articles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/articles/${a.slug}`}
                      className="group flex items-center gap-3 overflow-hidden rounded-xl border border-ink/10 bg-white/60 p-3 transition-colors hover:border-brass"
                    >
                      <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-16 w-24 flex-shrink-0 rounded-lg" />
                      <div>
                        <span className="font-mono text-[11px] text-brass-dark">{a.tag}</span>
                        <p className="mt-1 font-display text-base text-ink group-hover:text-brass-dark">{a.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
