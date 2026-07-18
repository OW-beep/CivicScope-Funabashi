import Head from "next/head";
import Link from "next/link";
import ScopeMark from "../components/ScopeMark";
import StatCard from "../components/StatCard";
import SectionLabel from "../components/SectionLabel";
import AdSlot from "../components/AdSlot";
import { siteConfig, datasets } from "../data/siteConfig";
import { articles } from "../data/articles";
import {
  getDatasetRecords,
  normalizePopulationSeries,
  buildPopulationInsights,
  getOrgDatasetCount
} from "../lib/bodik";

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
  return (
    <>
      <Head>
        <title>{`${siteConfig.name}｜${siteConfig.tagline}`}</title>
        <meta name="description" content={siteConfig.description} />
      </Head>

      {/* --- Hero ------------------------------------------------------ */}
      <section className="ledger-grid border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-5 py-20 md:py-28">
          <div className="mb-6 flex items-center gap-2 text-brass-dark">
            <ScopeMark className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">
              Funabashi Open Data / 非公式データメディア
            </span>
          </div>

          <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-5xl">
            {siteConfig.tagline}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            {siteConfig.description} 船橋市オープンデータカタログが公開する
            <span className="font-mono text-brass-dark"> {orgDatasetCount ?? "600"}件超 </span>
            のデータセットの中から、暮らしに近いものを選び、グラフや検索機能を添えてお届けします。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="border border-ink bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-ink-light"
            >
              人口ダッシュボードを見る
            </Link>
            <Link
              href="/chokai"
              className="border border-ink/30 px-5 py-3 text-sm text-ink transition-colors hover:border-brass hover:text-brass-dark"
            >
              町会・自治会を検索
            </Link>
            <Link
              href="/food-businesses"
              className="border border-ink/30 px-5 py-3 text-sm text-ink transition-colors hover:border-brass hover:text-brass-dark"
            >
              飲食店・食品施設を検索
            </Link>
          </div>
        </div>
      </section>

      {/* --- 現在地スナップショット ------------------------------------ */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <SectionLabel code="01">いまの船橋市</SectionLabel>
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

      <section className="mx-auto max-w-5xl px-5 pb-6">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} className="h-24" />
      </section>

      {/* --- 解説記事 ---------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <SectionLabel code="02">解説記事</SectionLabel>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="group flex flex-col border border-ink/10 bg-white/50 p-5 transition-colors hover:border-brass"
            >
              <span className="font-mono text-xs text-brass-dark">{a.tag}</span>
              <h3 className="mt-2 font-display text-lg leading-snug text-ink group-hover:text-brass-dark">
                {a.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.excerpt}</p>
              <span className="mt-4 text-xs font-mono text-ink-soft">続きを読む →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* --- 使い方 --------------------------------------------------- */}
      <section className="border-t border-ink/10 bg-white/40">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <SectionLabel code="03">CivicScope 船橋のしくみ</SectionLabel>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs text-brass-dark">STEP 1</p>
              <p className="mt-2 font-display text-lg text-ink">取得</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                船橋市オープンデータカタログ（BODIK ODCS）のAPIから、人口・地域データを定期的に取得します。
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-brass-dark">STEP 2</p>
              <p className="mt-2 font-display text-lg text-ink">整理・分析</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                前月比・前年同月比などの指標を自動計算し、検索や並び替えができる形に整えます。
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-brass-dark">STEP 3</p>
              <p className="mt-2 font-display text-lg text-ink">発信</p>
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
