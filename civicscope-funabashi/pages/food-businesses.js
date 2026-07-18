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
    const data = await getDatasetRecords(datasets.foodBusiness.id);
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

export default function FoodBusinesses({ fields, records, error }) {
  return (
    <>
      <Head>
        <title>{`食品営業施設一覧｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内で食品衛生法上の営業許可を取得している飲食店・食品取扱施設を、キーワード検索できる一覧にまとめました。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Directory</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">食品営業施設一覧</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.foodBusiness.label}」を、キーワードで検索・並び替えできる形にしています。
          {datasets.foodBusiness.description}
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 令和3年6月1日以降に新たに許可・届出された施設は含まれません。最新情報は
          <a
            href="https://ifas.mhlw.go.jp/faspub/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            厚生労働省 食品衛生申請等システム
          </a>
          をご確認ください。
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a href={datasets.foodBusiness.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">
              原典データセットを見る →
            </a>
          </div>
        ) : (
          <div className="mt-8">
            <SearchableTable fields={fields} records={records} searchPlaceholder="施設名・住所・業種で検索" />
          </div>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 営業許可は更新・廃業により変動します。正確な現況は船橋市保健所（生活衛生課）にご確認ください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOD} className="h-24" />
        </div>
      </section>
    </>
  );
}
