import Seo from "../components/Seo";
import Link from "next/link";
import SectionLabel from "../components/SectionLabel";
import { siteConfig } from "../data/siteConfig";

// Amazonの商品詳細ページへの直リンクは、掲載終了・ASIN変更で切れやすいため、
// カテゴリ検索結果ページへのリンク（?k=キーワード&tag=アソシエイトID）にしている。
// これはAmazonアソシエイト・プログラムで認められた一般的な手法で、リンク切れの
// リスクを避けつつ、読者は検索結果の中から実際に売れている商品を自分で選べる。
function amazonSearchUrl(keyword) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${siteConfig.amazonAssociateTag}`;
}

const ITEMS = [
  {
    title: "非常食セット（3日分〜）",
    keyword: "非常食セット 3日分",
    body: "災害発生から支援物資が届くまでの目安は、最低3日、できれば7日分とされています。アルファ化米・缶詰パン・レトルト食品などを組み合わせたセットが定番ですが、普段から少し多めに買っておき、期限が近いものから消費して買い足す「ローリングストック」の方が、賞味期限切れを防ぎやすく続けやすい方法です。"
  },
  {
    title: "保存水（5年保存）",
    keyword: "保存水 5年保存",
    body: "水は1人1日3リットルが目安です。3日分なら1人9リットル、4人家族なら36リットルが必要になります。重くてかさばるため、玄関や車のトランクなど複数箇所に分けて置いておくと、いざというとき持ち出しやすくなります。"
  },
  {
    title: "携帯トイレ・簡易トイレ",
    keyword: "携帯トイレ 防災 凝固剤",
    body: "断水時に後回しにされがちですが、実際の被災地では優先度が高いアイテムです。トイレは1人1日5回前後使うと想定して、最低3日分（1人15回分）を目安に備えておくと安心です。"
  },
  {
    title: "防災ラジオ・モバイルバッテリー",
    keyword: "手回し充電 ラジオ ライト 防災",
    body: "停電時は、スマートフォンの充電切れと情報不足が同時に起こりやすい場面です。手回し充電や太陽光充電に対応したラジオ・ライトの複合機、大容量のモバイルバッテリーがあると、行政や本サイトの防災ダッシュボードのような情報にもアクセスし続けられます。"
  },
  {
    title: "防災リュック（非常用持ち出し袋）",
    keyword: "防災リュック 防災士監修",
    body: "上記のアイテムを一つ一つ揃えるのが大変な場合は、防災士監修の非常用持ち出し袋セットから始めるのも一つの方法です。ただし詰め合わせの内容は玉石混交なので、届いたら一度中身を開けて確認し、家族構成に合わせて（乳幼児用品・常備薬・老眼鏡など）不足しているものを足しておくことをおすすめします。"
  }
];

export default function RecommendedDisasterGoods() {
  return (
    <>
      <Seo
        title={`船橋市民のための防災グッズの選び方｜${siteConfig.name}`}
        description="船橋市の防災データ（火災件数・避難場所の分布など）を踏まえて、家庭で備えておきたい防災グッズの選び方を解説します。"
        path="/recommended-disaster-goods"
      />

      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Guide</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市民のための防災グッズの選び方</h1>

        {/* Amazonアソシエイト・プログラム運営規約で定められた開示文言。
            読者がリンクをクリックする前に必ず目に入るよう、本文の直前に配置している。 */}
        <p className="mt-4 rounded-lg bg-ink/5 px-4 py-2.5 text-xs text-ink-soft">
          Amazonのアソシエイトとして、{siteConfig.nameJa}は適格販売により収入を得ています。
        </p>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
          本サイトでは、
          <Link href="/articles/fire-statistics-guide" className="underline hover:text-brass-dark">
            火災統計
          </Link>
          や
          <Link href="/articles/evacuation-map-guide" className="underline hover:text-brass-dark">
            避難場所マップ
          </Link>
          、
          <Link href="/disaster-prevention" className="underline hover:text-brass-dark">
            防災ダッシュボード
          </Link>
          など、船橋市が公開する防災関連データを紹介しています。
          データを見て「では実際に何を備えておけばいいのか」と思った方向けに、家庭の防災グッズを揃える際の考え方と、
          カテゴリ別の選び方をまとめました。特定の商品を強く推奨するものではなく、まずは何から揃えればよいかの
          道しるべとしてご利用ください。
        </p>

        <div className="mt-10 space-y-10">
          {ITEMS.map((item) => (
            <div key={item.keyword} className="border-t border-ink/10 pt-8">
              <SectionLabel category="safety">{item.title}</SectionLabel>
              <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{item.body}</p>
              <a
                href={amazonSearchUrl(item.keyword)}
                target="_blank"
                rel="noreferrer sponsored"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-bold text-white shadow-pop-brass transition-transform hover:-translate-y-0.5"
              >
                Amazonで「{item.title}」を見る
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink/10 pt-8">
          <SectionLabel code="NOTE">この記事について</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            本記事は船橋市や船橋市消防局の公式な推奨物資ではなく、CivicScope船橋編集部が一般的な防災の考え方をもとに
            独自にまとめたものです。持病・乳幼児・高齢者・ペットの有無など、ご家庭の事情に応じて必要な物資は異なります。
            より詳しい・公式な情報は
            <a
              href="https://www.city.funabashi.lg.jp/bousai/index.html"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-brass-dark"
            >
              船橋市の防災ページ
            </a>
            をご確認ください。
          </p>
        </div>
      </section>
    </>
  );
}
