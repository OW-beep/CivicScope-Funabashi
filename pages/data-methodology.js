import Seo from "../components/Seo";
import Link from "next/link";
import { siteConfig } from "../data/siteConfig";

export default function DataMethodology() {
  return (
    <>
      <Seo
        title={`データの取得・加工方法について｜${siteConfig.name}`}
        description="CivicScope船橋が、船橋市のオープンデータをどのように取得・集計・加工しているかをまとめたページです。"
        path="/data-methodology"
      />

      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">About the data</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">データの取得・加工方法について</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          CivicScope船橋は、船橋市や国（総務省統計局のe-Statなど）が公開しているオープンデータを取得し、
          必要に応じて集計・加工したうえでダッシュボードや記事として掲載しています。データをただ転載する
          のではなく、どのように扱っているかをここに明記します。
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-lg text-ink">元データ</h2>
            <p className="mt-2">
              ダッシュボードの多くは、船橋市オープンデータカタログ（BODIK
              ODCS）が公開しているデータセットを、CKANの検索API（datastore_search）経由で取得しています。
              一部のデータ（検索可能な形式に対応していない、ごく少数のデータセット）は、原典のCSVファイルを
              直接確認したうえで、手動で転記しています。人口・世帯数の一部は、e-Stat（政府統計の総合窓口）の
              国勢調査・小地域集計をAPI経由で取得しています。各ページの出典リンクから、必ず元データを
              確認できます。
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">取得日・更新頻度</h2>
            <p className="mt-2">
              BODIK・e-Stat経由で自動取得しているダッシュボードは、24時間ごとに最新データを再取得しています
              （Next.jsのISRという仕組みで、ビルド時・一定時間ごとの再生成時にのみ取得し、訪問のたびに
              通信するわけではありません）。手動で転記した一部のデータ（このページのすぐ下で個別に案内して
              いる小規模なデータセット）は、記事内に「原典確認日」や前提を明記し、更新の都度、原典を
              再確認しています。
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">集計単位・座標化の方法</h2>
            <p className="mt-2">
              地図に表示している施設の座標は、住所欄がある場合は国土地理院の住所検索APIで、住所欄が無い
              場合は施設名から抽出した町丁目名、またはOpenStreetMap（Nominatim）での施設名検索で求めています。
              いずれも無料・公的または準公的なAPIで、独自に緯度経度を推測しているわけではありません。ただし
              住所欄が無いデータセットでの座標化は、GSIの住所検索より一致率・精度が下がる場合があります。
              町丁目単位の集計（地区マップ等）は、住所の表記ゆれにより実際より少なく数えられる施設がある
              点にご留意ください。
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">欠損値・秘匿値の扱い</h2>
            <p className="mt-2">
              e-Statの町丁目別人口・世帯数は、人数が少ない町丁目で秘匿されている場合があります。秘匿されて
              いる値は「無い」ものとして扱い、0人などと推測して埋めることはしていません。同様に、住所や
              名称から座標を特定できなかった施設は、地図には表示せず、一覧（テーブル）側でのみ確認できる
              形にしています。
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">独自集計・指数について</h2>
            <p className="mt-2">
              <Link href="/district-explorer" className="underline hover:text-brass-dark">地区マップ</Link>
              の「施設充実度ランキング」のように、複数のデータセットを
              組み合わせた本サイト独自の指標もあります。こうした指標は、計算方法（何を・どう合算しているか）
              を、掲載しているページ内に必ず明記しています。重み付けの根拠が無い項目は、恣意的な操作を
              避けるため、均等に扱うようにしています。
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">誤りがあった場合</h2>
            <p className="mt-2">
              データの解釈や集計に誤りがあることに気づかれた場合は、<Link href="/contact" className="underline hover:text-brass-dark">お問い合わせページ</Link>からご連絡ください。
              確認のうえ、該当ページを修正します。
            </p>
          </div>
        </div>

        <p className="mt-10 text-xs text-ink-soft">
          あわせて、<Link href="/about" className="underline hover:text-brass-dark">運営者について</Link>・
          <Link href="/terms" className="underline hover:text-brass-dark">利用規約・データの出典</Link>もご覧ください。
        </p>
      </section>
    </>
  );
}
