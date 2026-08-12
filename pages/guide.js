import Seo from "../components/Seo";
import Link from "next/link";
import { siteConfig } from "../data/siteConfig";

const DASHBOARD_GUIDE = [
  {
    title: "人口ダッシュボード",
    href: "/dashboard",
    body: "船橋市の「毎月常住人口情報」をもとに、人口の月次推移と、前月比・前年同月比を自動計算しています。まちの人口が増えているのか、落ち着いてきているのかを大づかみに把握したいときに。"
  },
  {
    title: "子ども・子育てダッシュボード",
    href: "/children",
    body: "年度別の乳児数の推移と、児童の年齢別人口を可視化しています。未就学児・小学生・中学生といったライフステージ別の内訳も見られるので、保育・教育のニーズを考える手がかりになります。"
  },
  {
    title: "保育園ダッシュボード",
    href: "/childcare",
    body: "保育施設の定員数・入所児童数・待機数の推移に加えて、公立保育所の地図と、各保育所から徒歩10分圏内にある公園・図書館・避難所の件数も確認できます。"
  },
  {
    title: "学校ダッシュボード",
    href: "/schools",
    body: "市立中学校の生徒数（市内合計）の年度推移を可視化しています。長期的な増減の波から、まちの人口動態を読み解く材料としてご活用ください。"
  },
  {
    title: "公園・広場ダッシュボード",
    href: "/parks",
    body: "市内の広場・特色のある公園を検索でき、実際の地図上でも確認できます。"
  },
  {
    title: "地区マップ",
    href: "/district-explorer",
    body: "町丁目ごとの施設分布（広場・公園・保育所・生活衛生施設・食品営業施設）と、e-Stat経由の人口・世帯数を確認できます。本サイト独自の「人口1,000人あたり施設数」ランキングもここにあります。"
  },
  {
    title: "町会・自治会ダッシュボード",
    href: "/chokai",
    body: "町会・自治会の分布を、町丁目別の地図とランキングで確認できます。引っ越し先の地域とのつながりを知る入り口に。"
  },
  {
    title: "食品営業施設ダッシュボード／生活衛生施設ダッシュボード",
    href: "/food-businesses",
    body: "飲食店などの食品営業施設、美容室・クリーニング店・銭湯などの生活衛生関係施設を、それぞれ町丁目別の分布と業種別ランキングで可視化しています。"
  },
  {
    title: "高齢者向け住宅ダッシュボード",
    href: "/senior-housing",
    body: "サービス付き高齢者向け住宅の分布・件数と、市全体の高齢化率の推移を確認できます。"
  },
  {
    title: "防災ダッシュボード",
    href: "/disaster-prevention",
    body: "避難場所・避難所・帰宅困難者支援施設・AED設置施設・公衆無線LANを、ひとつの地図にレイヤーとして重ねて表示しています。災害種別ごとに、対応している施設だけを絞り込んで表示することもできます。"
  },
  {
    title: "犬の登録・予防注射ダッシュボード",
    href: "/dog-registration",
    body: "犬の登録頭数と狂犬病予防注射の実施頭数の推移、その比率を可視化しています。"
  }
];

export default function Guide() {
  return (
    <>
      <Seo
        title={`ダッシュボードの使い方｜${siteConfig.name}`}
        description="CivicScope船橋にあるダッシュボードの一覧と、それぞれで何が確認できるかをまとめた使い方ガイドです。"
        path="/guide"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Guide</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">ダッシュボードの使い方</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          CivicScope船橋では、船橋市が公開するオープンデータをもとに、少しずつダッシュボードを増やしてきました。
          数が増えてきたので、それぞれ何を確認できるのか、ここに一覧としてまとめておきます。
        </p>

        <div className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
          {DASHBOARD_GUIDE.map((d) => (
            <Link key={d.href} href={d.href} className="group flex flex-col gap-1 py-5 hover:bg-ink/[0.02]">
              <h2 className="font-display text-lg text-ink group-hover:text-brass-dark">{d.title}</h2>
              <p className="text-sm text-ink-soft">{d.body}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink-soft">
          「このデータも見てみたい」というご要望があれば、<Link href="/contact" className="underline hover:text-brass-dark">お問い合わせページ</Link>からぜひお寄せください。
        </p>
      </section>
    </>
  );
}
