import Seo from "../components/Seo";
import Link from "next/link";
import ScopeMark from "../components/ScopeMark";
import StatCard from "../components/StatCard";
import SectionLabel from "../components/SectionLabel";
import AdSlot from "../components/AdSlot";
import FunabashiMapMotif from "../components/FunabashiMapMotif";
import PearIcon from "../components/PearIcon";
import ArticleThumbnail from "../components/ArticleThumbnail";
import PickupCarousel from "../components/PickupCarousel";
import CategoryIntroBoxes from "../components/CategoryIntroBoxes";
import { siteConfig, datasets } from "../data/siteConfig";
import { CATEGORY_LIST, CATEGORY_CLASSES } from "../data/categories";
import { getArticlesSortedByDate, getFeaturedArticles } from "../data/articles";
import {
  getDatasetRecords,
  normalizePopulationSeries,
  buildPopulationInsights,
  getOrgDatasetCount
} from "../lib/bodik";

const DASHBOARD_LINKS = [
  {
    href: "/dashboard",
    category: "life",
    title: "人口ダッシュボード",
    description: "常住人口の月次推移と前月比・前年同月比を自動集計。"
  },
  {
    href: "/children",
    category: "kids",
    title: "子ども・子育てダッシュボード",
    description: "年度別乳児数の推移と、児童の年齢別人口の内訳を可視化。"
  },
  {
    href: "/schools",
    category: "kids",
    title: "学校ダッシュボード",
    description: "船橋市立中学校の生徒数（市内合計）の年度推移を可視化。"
  },
  {
    href: "/senior-housing",
    category: "life",
    title: "高齢者向け住宅ダッシュボード",
    description: "サービス付き高齢者向け住宅の入居者数の推移と施設の分布を可視化。"
  },
  {
    href: "/welfare",
    category: "life",
    title: "生活保護ダッシュボード",
    description: "被保護世帯数の推移と世帯人員別の内訳を可視化。"
  },
  {
    href: "/public-safety",
    category: "safety",
    title: "治安・救急ダッシュボード",
    description: "刑法犯認知件数と救急出動件数の推移を可視化。"
  },
  {
    href: "/finance",
    category: "life",
    title: "財政ダッシュボード",
    description: "歳入・歳出・市債残高の推移と、家計に例えた内訳を可視化。"
  },
  {
    href: "/gender-participation",
    category: "social",
    title: "女性参画ダッシュボード",
    description: "市議会・審議会等の女性参画比率と男女共同参画センターの利用状況を可視化。"
  },
  {
    href: "/employment",
    category: "social",
    title: "雇用・求人ダッシュボード",
    description: "有効求人倍率・新規求人数・新規求職申込件数の推移を可視化。"
  },
  {
    href: "/citizen-consultation",
    category: "life",
    title: "市民相談ダッシュボード",
    description: "市民相談・要望の件数の推移と内訳を可視化。"
  },
  {
    href: "/parks",
    category: "town",
    title: "公園・広場ダッシュボード",
    description: "市内の広場・特色のある公園を検索できる一覧。"
  },
  {
    href: "/rail-ridership",
    category: "transit",
    title: "鉄道駅別乗車人員ダッシュボード",
    description: "市内35駅×事業者の1日平均乗車人員のランキングと推移を可視化。"
  },
  {
    href: "/bus-ridership",
    category: "transit",
    title: "市内バス運輸状況ダッシュボード",
    description: "バス事業者別の乗車人員・運行台数の推移を可視化。"
  },
  {
    href: "/childcare",
    category: "kids",
    title: "保育園ダッシュボード",
    description: "保育施設の定員数・入所児童数・待機数の推移を可視化。"
  },
  {
    href: "/chokai",
    category: "town",
    title: "町会・自治会ダッシュボード",
    description: "町丁目別の分布マップとランキングで地域のつながりを可視化。"
  },
  {
    href: "/food-businesses",
    category: "safety",
    title: "食品営業施設ダッシュボード",
    description: "飲食店・食品取扱施設の分布マップと業種別ランキング。"
  },
  {
    href: "/life-sanitation",
    category: "safety",
    title: "生活衛生施設ダッシュボード",
    description: "美容所・クリーニング所・旅館・公衆浴場などの分布マップと業種別ランキング。"
  },
  {
    href: "/disaster-prevention",
    category: "safety",
    title: "防災ダッシュボード",
    description: "避難場所・避難所・帰宅困難者支援施設・AED・公衆無線LANの位置を地図に重ねて可視化。"
  },
  {
    href: "/dog-registration",
    category: "town",
    title: "犬の登録・予防注射ダッシュボード",
    description: "登録頭数と予防注射実施頭数の推移、接種割合の目安を可視化。"
  }
];

const FUN_FACTS = [
  "日本梨の一大産地として知られ、「船橋のなし」は市を代表する特産品。",
  "南船橋の「ららぽーとTOKYO-BAY」は、日本における大型ショッピングセンターの先駆けとして1981年に開業した。",
  "家具量販店IKEAが日本第1号店を出店したのも船橋市（2006年、南船橋）。",
  "中央競馬の「船橋競馬場」があり、ナイター開催の「トゥインクルレース」でも知られる。",
  "「ふなばし三番瀬海浜公園」は東京湾に残る貴重な干潟で、潮干狩りや野鳥観察の名所。",
  "船橋大神宮（意富比神社）には、かつて灯台の役割も果たした「灯明台」が今も残る。"
];

export async function getStaticProps() {
  let populationLatest = null;
  let populationYoyRate = null;
  let chokaiCount = null;
  let orgDatasetCount = null;

  try {
    const popData = await getDatasetRecords(datasets.population.id);
    const normalized = normalizePopulationSeries(popData);
    const insights = buildPopulationInsights(normalized);
    if (insights) {
      populationLatest = insights.latest.total;
      populationYoyRate = insights.yoyRate;
    }
  } catch (e) {
    // ビルド時にAPIが一時的に落ちていてもサイト全体は壊さない
  }

  try {
    const chokaiData = await getDatasetRecords(datasets.chokai.id);
    chokaiCount = chokaiData.records?.length || null;
  } catch (e) {
    // noop
  }

  try {
    orgDatasetCount = await getOrgDatasetCount(siteConfig.bodik.orgId);
  } catch (e) {
    // noop
  }

  return {
    props: { populationLatest, populationYoyRate, chokaiCount, orgDatasetCount },
    revalidate: 60 * 60 * 12
  };
}

export default function Home({ populationLatest, populationYoyRate, chokaiCount, orgDatasetCount }) {
  const latestArticles = getArticlesSortedByDate().slice(0, 3);
  const featuredArticles = getFeaturedArticles(3);
  const pickupArticles = getFeaturedArticles(5);
  return (
    <>
      <Seo
        title={`${siteConfig.name}｜${siteConfig.tagline}`}
        description={siteConfig.description}
        path=""
      />

      {/* --- Hero ------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-paper-dark">
        <FunabashiMapMotif className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 md:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brass px-4 py-1.5 text-white shadow-pop-brass">
            <ScopeMark className="h-4 w-4" strokeWidth={4} />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.15em]">
              Funabashi Open Data ／ 非公式データメディア
            </span>
          </div>

          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            {siteConfig.tagline}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            {siteConfig.description} 船橋市オープンデータカタログが公開する
            <span className="font-bold text-brass-dark"> {orgDatasetCount ?? "600"}件超 </span>
            のデータセットの中から、暮らしに近いものを選び、グラフや検索機能を添えてお届けします。
            引っ越し先を検討中の方が地域の子育て・防災環境を調べたり、今お住まいの方がまちの変化を
            確認したり、調べ物や記事の裏付けに使ったりと、目的に合わせてご活用ください。
          </p>
          <p className="mt-3 max-w-xl font-mono text-xs text-ink-soft">
            ダッシュボードは原則24時間ごとに自動更新（
            <Link href="/data-methodology" className="underline hover:text-brass-dark">
              データの取得・加工方法について
            </Link>
            ）
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper shadow-pop transition-transform hover:-translate-y-0.5 hover:bg-ink-light"
            >
              人口ダッシュボードを見る
            </Link>
            <Link
              href="/chokai"
              className="rounded-full border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-brass hover:text-brass-dark"
            >
              町会・自治会の分布を見る
            </Link>
            <Link
              href="/food-businesses"
              className="rounded-full border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-brass hover:text-brass-dark"
            >
              食品営業施設の分布を見る
            </Link>
          </div>

          {/* カテゴリ帯：福岡市のオープンデータサイトを参考に、分野ごとに色分けしたタグで
              ダッシュボード一覧への入り口を用意している */}
          <div className="mt-10 flex flex-wrap gap-2.5">
            {CATEGORY_LIST.map((cat) => {
              const cls = CATEGORY_CLASSES[cat.key];
              return (
                <a
                  key={cat.key}
                  href={`#cat-${cat.key}`}
                  className={`inline-flex items-center gap-1.5 rounded-full ${cls.bgSoft} px-4 py-2 text-sm font-bold ${cls.text} transition-transform hover:-translate-y-0.5`}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  {cat.label}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- カテゴリ紹介ボックス（ヒーロー内のタグ一覧のすぐ下に表示） -------- */}
      <CategoryIntroBoxes />

      {/* --- ピックアップ記事（自動送りカルーセル） --------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Pick Up</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">ピックアップ記事</h2>
        <div className="mt-6">
          <PickupCarousel articles={pickupArticles} />
        </div>
      </section>

      {/* --- 現在地スナップショット ------------------------------------ */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <SectionLabel code="01" category="life">いまの船橋市</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="常住人口（最新月）"
            value={populationLatest ? populationLatest.toLocaleString("ja-JP") : "―"}
            unit="人"
            delta={
              populationYoyRate !== null
                ? `${populationYoyRate > 0 ? "+" : ""}${populationYoyRate.toFixed(2)}%`
                : null
            }
            deltaLabel="前年同月比"
            tone={populationYoyRate > 0 ? "up" : populationYoyRate < 0 ? "down" : "neutral"}
          />
          <StatCard
            label="町会・自治会 登録数"
            value={chokaiCount ? chokaiCount.toLocaleString("ja-JP") : "―"}
            unit="件"
          />
          <StatCard
            label="公開データセット数"
            value={orgDatasetCount ? orgDatasetCount.toLocaleString("ja-JP") : "―"}
            unit="件"
          />
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          出典：船橋市オープンデータカタログ（{siteConfig.bodik.license}）。詳細は
          <Link href="/dashboard" className="underline hover:text-brass-dark">ダッシュボード</Link>
          をご覧ください。
        </p>
      </section>

      {/* --- エリアマップへの誘導（ビジュアル） --------------------------- */}
      <section className="mx-auto max-w-5xl px-5 pb-6">
        <Link
          href="/area-map"
          className="group flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-pop transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <span className="rounded-full bg-bay/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-bay-dark">Illustrated Map</span>
            <h2 className="mt-2 font-display text-xl font-bold text-ink group-hover:text-brass-dark">
              船橋市 エリアマップを見る
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              実際の鉄道乗車人員データをもとにした、3エリアのイラストマップ
            </p>
          </div>
          <span className="shrink-0 font-bold text-sm text-brass-dark">
            地図を見る →
          </span>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-6">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} className="h-24" />
      </section>

      {/* --- 新着記事 ------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="flex items-baseline justify-between">
          <SectionLabel code="02" category="kids">新着記事</SectionLabel>
          <Link href="/articles" className="font-mono text-xs text-brass-dark hover:underline">
            すべての記事を見る →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latestArticles.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-pop transition-transform hover:-translate-y-0.5"
            >
              <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-32 w-full" />
              <div className="flex flex-1 flex-col p-5">
                <span className="w-fit rounded-full bg-brass/15 px-3 py-1 font-mono text-xs font-bold text-brass-dark">{a.tag}</span>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink group-hover:text-brass-dark">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.excerpt}</p>
                <span className="mt-4 text-xs font-bold text-brass-dark">続きを読む →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- よく読まれている記事（編集部おすすめ） --------------------- */}
      {featuredArticles.length ? (
        <section className="border-t border-ink/10 bg-paper-dark/50">
          <div className="mx-auto max-w-5xl px-5 py-14">
            <SectionLabel code="03" category="social">よく読まれている記事</SectionLabel>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
              編集部が特におすすめする記事です。まずはここから読んでみるのがおすすめです。
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {featuredArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-pop transition-transform hover:-translate-y-0.5"
                >
                  <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-32 w-full" />
                  <div className="flex flex-1 flex-col p-5">
                    <span className="w-fit rounded-full bg-brass/15 px-3 py-1 font-mono text-xs font-bold text-brass-dark">{a.tag}</span>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink group-hover:text-brass-dark">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.excerpt}</p>
                    <span className="mt-4 text-xs font-bold text-brass-dark">続きを読む →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* --- ダッシュボード一覧（カテゴリごとにグループ化。サイト全体のタグバーからの
            アンカーリンク先 #cat-xxx にもなっている） ------------------------------ */}
      <section id="dashboards" className="mx-auto max-w-5xl px-5 py-14 scroll-mt-20">
        <SectionLabel code="04" category="town">ダッシュボード一覧</SectionLabel>
        <div className="space-y-10">
          {CATEGORY_LIST.map((cat) => {
            const cls = CATEGORY_CLASSES[cat.key];
            const items = DASHBOARD_LINKS.filter((d) => d.category === cat.key);
            if (!items.length) return null;
            return (
              <div key={cat.key} id={`cat-${cat.key}`} className="scroll-mt-24">
                <h3 className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-pop">
                  <span className={`h-2.5 w-2.5 rounded-full ${cls.dot}`} aria-hidden="true" />
                  <span className={`text-sm font-bold ${cls.text}`}>
                    {cat.emoji} {cat.label}
                  </span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      className="group relative overflow-hidden rounded-2xl bg-white p-5 pl-6 shadow-pop transition-transform hover:-translate-y-0.5"
                    >
                      <span className={`absolute inset-y-0 left-0 w-1.5 ${cls.dot}`} aria-hidden="true" />
                      <h4 className={`font-display text-lg font-bold text-ink ${cls.groupHoverText}`}>
                        {d.title}
                      </h4>
                      <p className="mt-2 text-sm text-ink-soft">{d.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- 船橋豆知識（オープンデータだけではない、まちの魅力） -------- */}
      <section className="border-t border-ink/10 bg-bay/5">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <SectionLabel code="05" category="town">船橋、知ってる？</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            CivicScope船橋はデータだけでなく、まちの魅力もあわせて発信していきます。まずは船橋にまつわる豆知識から。
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {FUN_FACTS.map((fact) => (
              <li
                key={fact}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink-soft shadow-pop"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brass/15">
                  <PearIcon className="h-4 w-4 text-brass-dark" />
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- 使い方 --------------------------------------------------- */}
      <section className="border-t border-ink/10 bg-paper-dark/50">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <SectionLabel code="06" category="social">CivicScope 船橋のしくみ</SectionLabel>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-pop">
              <p className="inline-block rounded-full bg-bay/15 px-3 py-1 font-mono text-xs font-bold text-bay-dark">STEP 1</p>
              <p className="mt-3 font-display text-lg font-bold text-ink">取得</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                船橋市オープンデータカタログ（BODIK ODCS）のAPIから、人口・地域データを定期的に取得します。
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-pop">
              <p className="inline-block rounded-full bg-bay/15 px-3 py-1 font-mono text-xs font-bold text-bay-dark">STEP 2</p>
              <p className="mt-3 font-display text-lg font-bold text-ink">整理・分析</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                前月比・前年同月比などの指標を自動計算し、検索や並び替えができる形に整えます。
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-pop">
              <p className="inline-block rounded-full bg-bay/15 px-3 py-1 font-mono text-xs font-bold text-bay-dark">STEP 3</p>
              <p className="mt-3 font-display text-lg font-bold text-ink">発信</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                グラフ・表・解説記事という3つの形で、専門知識がなくても読み解けるように届けます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
