import Seo from "../components/Seo";
import Link from "next/link";
import { siteConfig } from "../data/siteConfig";
import { articles as allArticles } from "../data/articles";
import ArticleThumbnail from "../components/ArticleThumbnail";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../components/Breadcrumbs";

// 暮らしの手続きガイド（目的別・悩み別の入口ページ）。
// 「引っ越した」「子どもが入学する」「夜に具合が悪くなった」のように、困りごとから記事を探せるようにする。
// 各コレクションの導入文は、このページ独自の解説（市の公式ページで確認した内容にとどめる）。

// 期限が近いもの。deadline（YYYY-MM-DD）を過ぎた項目は、ビルド時に自動で非表示になる。
// 年度が替わったら、内容を見直して、更新してください。
const URGENT_ITEMS = [
  {
    slug: "funabashi-nursery-application-r9-guide",
    label: "保育園・認定こども園の申込（令和9年4月入園）",
    when: "11月30日（月）まで",
    deadline: "2026-11-30"
  },
  {
    slug: "funabashi-wooden-house-earthquake-subsidy-guide",
    label: "木造住宅の耐震改修の助成（令和8年度の受付）",
    when: "11月30日（月）まで",
    deadline: "2026-11-30"
  },
  {
    slug: "funabashi-school-entrance-flow-guide",
    label: "就学時健診（就学前検診）：令和9年4月に小学校へ入る子",
    when: "11月中に、各小学校で",
    deadline: "2026-11-30"
  },
  {
    slug: "funabashi-senior-influenza-vaccine-guide",
    label: "高齢者のインフルエンザ予防接種（定期接種）",
    when: "12月31日まで",
    deadline: "2026-12-31"
  },
  {
    slug: "after-school-room-guide",
    label: "放課後ルーム（学童）の入所申請：令和9年4月入所の一次申請",
    when: "市の案内で11月1日受付開始。締切は入所のご案内で確認",
    deadline: "2026-12-15"
  }
];

// よく使う連絡先。いずれも、各記事で、市の公式ページを確認したもの。受付時間は、各記事に書いてある。
const CONTACTS = [
  { label: "マイナンバーカード", who: "戸籍住民課コールセンター", tel: "047-436-2272", slug: "funabashi-my-number-card-guide" },
  { label: "ごみの出し方・分別", who: "クリーン推進課", tel: "047-436-2434", slug: "funabashi-garbage-rules-guide" },
  { label: "粗大ごみの申し込み", who: "粗大ごみ受付センター", tel: "047-457-4153", slug: "funabashi-oversized-waste-guide" },
  { label: "町会・自治会", who: "自治振興課", tel: "047-436-2022", slug: "funabashi-chokai-join-guide" },
  { label: "学区・通学指定校変更", who: "学務課 学事係", tel: "047-436-2853", slug: "funabashi-school-district-guide" },
  { label: "保育園の申込", who: "保育入園課", tel: "047-436-2330", slug: "funabashi-nursery-application-r9-guide" },
  { label: "高齢者のインフルエンザ予防接種", who: "健康づくり課", tel: "047-409-1764", slug: "funabashi-senior-influenza-vaccine-guide" },
  { label: "木造住宅の耐震診断・改修の助成", who: "建築指導課 耐震係", tel: "047-436-2632", slug: "funabashi-wooden-house-earthquake-subsidy-guide" },
  { label: "夜間・休日の急病", who: "夜間休日急病診療所", tel: "047-424-2327", slug: "funabashi-night-holiday-clinic-guide" },
  { label: "受診先の案内（24時間）", who: "ふなばし健康ダイヤル24", tel: "0120-2784-37", slug: "funabashi-night-holiday-clinic-guide" }
];

const COLLECTIONS = [
  {
    key: "moving",
    title: "引っ越してきたら（手続き・暮らしの始まり）",
    description:
      "引っ越し直後は、転入届、マイナンバーカード、ごみ、町会・自治会、学区と、やることが重なります。市の公式ページで確認した、期限・窓口・持ち物をまとめた記事を、上から順に並べました。住まい選びの参考になる、駅や地価のデータの記事も、あわせて載せています。",
    slugs: [
      "funabashi-moving-in-checklist",
      "funabashi-my-number-card-guide",
      "funabashi-garbage-rules-guide",
      "funabashi-oversized-waste-guide",
      "funabashi-chokai-join-guide",
      "funabashi-school-district-guide",
      "funabashi-dog-registration-procedure-guide",
      "funabashi-station-passengers-guide",
      "rail-ridership-guide",
      "area-guide-central-funabashi",
      "area-guide-north-narashinodai",
      "land-price-by-railway-line-guide",
      "funabashi-population-latest-guide",
      "why-funabashi-charm-guide",
      "vacant-homes-guide"
    ]
  },
  {
    key: "childrearing",
    title: "子育て・教育（申込・手続きから、環境のデータまで）",
    description:
      "保育園、学童、入学、学区、手当や医療費の助成。子育ての手続きは、時期と締切が決まっているものが多く、知らずに期限を過ぎてしまうこともあります。市の公式ページをもとに、いつ・どこで・何を出すのかをまとめた記事を先に、子育て環境を数字で確かめる記事をあとに並べました。",
    slugs: [
      "funabashi-nursery-application-r9-guide",
      "after-school-room-guide",
      "funabashi-after-school-employment-certificate-guide",
      "funabashi-school-entrance-flow-guide",
      "funabashi-school-district-guide",
      "funabashi-child-allowance-guide",
      "funabashi-child-medical-subsidy-guide",
      "school-lunch-fee-free-guide",
      "school-cost-support-guide",
      "birth-childcare-support-guide",
      "is-funabashi-good-for-child-rearing",
      "childcare-guide",
      "parks-guide",
      "library-branches-guide"
    ]
  },
  {
    key: "safety",
    title: "健康・防災（いざというときの備え）",
    description:
      "夜に具合が悪くなったとき、災害情報をどう受け取るか、家の地震対策に使える助成はあるか。いざというときに、あわてないための記事です。まず、電話番号と場所を確認しておきたいものから並べました。そのあとに、市が公開している一次データをもとに、安全のようすを確かめる記事が続きます。",
    slugs: [
      "funabashi-night-holiday-clinic-guide",
      "funabashi-senior-influenza-vaccine-guide",
      "disaster-info-registration-guide",
      "funabashi-evacuation-place-by-town-guide",
      "evacuation-map-guide",
      "hazard-map-guide",
      "funabashi-wooden-house-earthquake-subsidy-guide",
      "aed-locations-guide",
      "funabashi-hot-days-guide",
      "fire-statistics-guide",
      "traffic-accident-trend-guide"
    ]
  },
  {
    key: "money",
    title: "税金・お金のことを知りたい方へ",
    description:
      "船橋市の税収は、令和7年度に1,158.5億円と、10年間で最高になりました。ただ、増えた分の約4分の3は個人市民税の1つで、前の年に減った分の戻りという面もあります。ふるさと納税による控除額（令和7年度は35.5億円）、1人あたりの税負担、土地や車にかかる税金の10年の変化など、市の公式資料から数字を拾い直し、「市のお金は、どこから入って、何に使われているのか」を確かめられる記事をまとめました。",
    slugs: [
      "funabashi-city-tax-revenue-guide",
      "funabashi-individual-resident-tax-guide",
      "furusato-nozei-outflow-guide",
      "finance-household-budget-guide",
      "finance-peer-comparison-guide",
      "average-income-guide",
      "funabashi-land-use-tax-data-guide",
      "funabashi-light-vehicle-count-guide"
    ]
  },
  {
    key: "culture",
    title: "船橋の暮らし・文化を知りたい方へ",
    description:
      "船橋市は「東京の隣のベッドタウン」というイメージが強いかもしれませんが、実際には梨の生産量が全国でも上位に入り、東京湾に面した三番瀬では今も漁業が営まれ、ホタルが見られる場所も残っています。統計データだけでは見えにくい、船橋という土地の個性に触れたい方向けの記事です。",
    slugs: [
      "funabashi-nashi-pears-guide",
      "funabashi-agriculture-output-guide",
      "funabashi-fishery-guide",
      "sanbanze-tidal-flat-guide",
      "funabashi-firefly-viewing-guide",
      "funabashi-daijingu-hatsumode-guide",
      "chokai-directory-guide"
    ]
  }
];

const pickArticle = (a) => ({ slug: a.slug, title: a.title, tag: a.tag, updated: a.updated || a.date });

export async function getStaticProps() {
  const bySlug = new Map(allArticles.map((a) => [a.slug, a]));
  const today = new Date().toISOString().slice(0, 10);
  const collections = COLLECTIONS.map((c) => ({
    key: c.key,
    title: c.title,
    description: c.description,
    articles: c.slugs.map((s) => bySlug.get(s)).filter(Boolean).map(pickArticle)
  }));
  const urgent = URGENT_ITEMS.filter((u) => u.deadline >= today && bySlug.has(u.slug)).map((u) => ({
    slug: u.slug,
    label: u.label,
    when: u.when
  }));
  const contacts = CONTACTS.filter((c) => bySlug.has(c.slug));
  return { props: { collections, urgent, contacts, total: allArticles.length } };
}

export default function Collections({ collections, urgent, contacts, total }) {
  const crumbs = [{ label: "ホーム", href: "/" }, { label: "暮らしの手続きガイド" }];
  const jsonLd = [
    buildBreadcrumbJsonLd(crumbs, siteConfig.url),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "船橋市の暮らしの手続きガイド",
      url: `${siteConfig.url}/collections`,
      inLanguage: "ja",
      hasPart: collections.flatMap((c) =>
        c.articles.slice(0, 8).map((a) => ({ "@type": "Article", headline: a.title, url: `${siteConfig.url}/articles/${a.slug}` }))
      )
    }
  ];
  return (
    <>
      <Seo
        title={`船橋市の暮らしの手続きガイド｜引っ越し・子育て・防災を、困りごとから探す｜${siteConfig.name}`}
        description="船橋市の転入届、マイナンバーカード、ごみの出し方、保育園の申込、学区、夜間の急病、耐震の助成まで。市の公式ページで確認した手続きの記事を、困りごとから探せます。期限が近いものと、よく使う連絡先つき。"
        path="/collections"
        jsonLd={jsonLd}
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <Breadcrumbs items={crumbs} />
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brass-dark">Guide</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市の暮らしの手続きガイド</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          引っ越し、子育て、教育、健康、防災。船橋市での暮らしで、困ったときに探せるように、{total}本の記事を、目的別にまとめました。
          手続きの記事は、市の公式ページを確認してから書いています（<Link href="/editorial-policy" className="underline hover:text-brass-dark">編集方針</Link>）。
          タグ別の一覧は<Link href="/articles" className="underline hover:text-brass-dark">解説記事一覧</Link>からもご覧いただけます。
        </p>

        {urgent.length > 0 ? (
          <div className="mt-10 rounded-2xl border border-brass/40 bg-brass/5 px-5 py-5">
            <h2 className="font-display text-xl text-ink">いま、期限が近いもの</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink">
              {urgent.map((u) => (
                <li key={u.slug + u.label}>
                  <Link href={`/articles/${u.slug}`} className="underline decoration-ink/20 underline-offset-4 hover:text-brass-dark">
                    {u.label}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-brass-dark">{u.when}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">期限は、年度ごとに変わります。申込の前に、必ず市の公式ページで確認してください。</p>
          </div>
        ) : null}

        <div className="mt-12 space-y-14">
          {collections.map((c) => (
            <div key={c.key}>
              <h2 className="font-display text-xl text-ink">{c.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{c.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {c.articles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="group flex items-center gap-3 overflow-hidden rounded-xl border border-ink/10 bg-white/60 p-3 transition-colors hover:border-brass"
                  >
                    <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-16 w-24 flex-shrink-0 rounded-lg" />
                    <div>
                      <span className="font-mono text-[11px] text-brass-dark">{a.tag}・更新 {a.updated}</span>
                      <p className="mt-1 font-display text-base leading-snug text-ink group-hover:text-brass-dark">{a.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-xl text-ink">よく使う連絡先</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            各記事で、船橋市の公式ページを確認したものです。受付時間や、くわしい条件は、記事の中に書いてあります。
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-xs text-ink-soft">
                  <th className="py-2 pr-4 font-normal">困りごと</th>
                  <th className="py-2 pr-4 font-normal">窓口</th>
                  <th className="py-2 font-normal">電話</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.label} className="border-b border-ink/10">
                    <td className="py-2 pr-4">
                      <Link href={`/articles/${c.slug}`} className="underline decoration-ink/20 underline-offset-4 hover:text-brass-dark">
                        {c.label}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-ink-soft">{c.who}</td>
                    <td className="py-2 font-mono">{c.tel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
