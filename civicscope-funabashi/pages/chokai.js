import Head from "next/head";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords } from "../lib/bodik";

export async function getStaticProps() {
  let fields = [];
  let records = [];
  let error = null;

  try {
    const data = await getDatasetRecords(datasets.chokai.id);
    fields = data.fields;
    records = data.records;
    if (!data.datastoreActive) {
      error = "このデータセットは検索可能な形式（DataStore）が未設定のため、原典サイトをご覧ください。";
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: { fields, records, error },
    revalidate: 60 * 60 * 24
  };
}

export default function Chokai({ fields, records, error }) {
  return (
    <>
      <Head>
        <title>{`町会・自治会一覧｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の町会・自治会一覧を、キーワード検索・並び替えできる形でまとめました。引っ越し先の地域情報を調べる手がかりに。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Directory</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">町会・自治会一覧</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.chokai.label}」を、キーワードで検索・並び替えできる形にしています。
          {datasets.chokai.description}
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a href={datasets.chokai.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">
              原典データセットを見る →
            </a>
          </div>
        ) : (
          <div className="mt-8">
            <SearchableTable fields={fields} records={records} searchPlaceholder="町会名・地区名で検索" />
          </div>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 加入方法や活動内容など詳細については、必ず船橋市の公式窓口にご確認ください。本一覧は検索性向上のための補助ツールです。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHOKAI} className="h-24" />
        </div>
      </section>
    </>
  );
}
