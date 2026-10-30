import Link from "next/link";
import Seo from "../components/Seo";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../components/Breadcrumbs";
import { siteConfig } from "../data/siteConfig";

const SECTIONS = [
  {
    heading: "記事の作り方",
    body: [
      "記事の数字は、船橋市の公式サイト、船橋市オープンデータカタログ（BODIK ODCS）、船橋市統計書、e-Stat（政府統計の総合窓口）、国土交通省などの、公的機関が公表している資料をもとにしています。",
      "使った資料は、各記事の末尾に「出典」または「参照した公開データ」として、リンク付きで載せています。出典を示せない数字は、記事に使いません。"
    ]
  },
  {
    heading: "数字の扱い方",
    body: [
      "公表されている数字と、このサイトが計算した数字は、区別して書きます。たとえば「人口密度」のように、公表値から割り算などで求めたものには、「編集部の計算」と添えています。",
      "公表された表に、前月差や合計が合わない箇所があるなど、誤りの可能性が高い場合は、その旨を記事に書き、どのように補正して使ったかを示します。",
      "国勢調査の速報値から確報値への切り替えなど、あとから数字が改定されるものは、記事の中で、その点に触れるようにしています。"
    ]
  },
  {
    heading: "事実と意見を分けて書く",
    body: [
      "記事の中の「筆者の見解」「筆者の体験」などの節は、運営者個人の考えや体験です。船橋市の公式の見解ではありません。データから読み取れること（事実）とは、節を分けて書いています。",
      "データだけでは分からないこと（原因など）は、「可能性がある」「このデータだけでは特定できない」と、はっきり書きます。"
    ]
  },
  {
    heading: "分かりやすさについて",
    body: [
      "できるだけ、誰にでも分かる言葉で書きます。むずかしい言葉には※印を付け、記事の最後の「言葉の説明」でやさしく説明します。",
      "記事の最後には、読んだ人が次にできる小さな行動を、「できること」として添えることがあります。"
    ]
  },
  {
    heading: "更新と訂正",
    body: [
      "数字が新しくなったり、制度が変わったりしたときは、記事を見直します。内容を見直した記事には、記事の冒頭に「更新」の日付を表示します。",
      "誤りや古い情報にお気づきの場合は、お問い合わせページからご連絡ください。確認のうえ、修正します。"
    ]
  },
  {
    heading: "広告・アフィリエイトについて",
    body: [
      "このサイトでは、広告（Google AdSense）やアフィリエイト（Amazonアソシエイト、楽天アフィリエイト）を利用することがあり、運営者に収入が生じる場合があります。商品リンクの枠には「PR」と表示します。",
      "商品リンクは、記事の話題と自然につながるもの（防災、お取り寄せ、引っ越しなど）がある記事にだけ載せます。広告や商品リンクのために、記事の内容や評価を変えることはありません。"
    ]
  },
  {
    heading: "このサイトの立場",
    body: [
      "CivicScope船橋は、個人が運営する非公式のサイトです。船橋市や、そのほかの行政機関とは関係がありません。手続きや制度の最終的な内容は、必ず船橋市の公式サイトや窓口でご確認ください。"
    ]
  }
];

export default function EditorialPolicy() {
  const crumbs = [{ label: "ホーム", href: "/" }, { label: "編集方針" }];
  return (
    <>
      <Seo
        title={`編集方針｜${siteConfig.name}`}
        description="シビックスコープ船橋の記事の作り方、数字の扱い方、事実と意見の分け方、更新と訂正、広告・アフィリエイトの方針をまとめています。"
        path="/editorial-policy"
        jsonLd={buildBreadcrumbJsonLd(crumbs, siteConfig.url)}
      />

      <section className="mx-auto max-w-2xl px-5 py-14">
        <Breadcrumbs items={crumbs} />
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brass-dark">Editorial Policy</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">編集方針</h1>
        <p className="mt-6 text-[15px] leading-[1.9] text-ink-soft">
          シビックスコープ船橋が、どのように記事をつくり、どのように見直しているかをまとめました。
          運営者については<Link href="/about#operator" className="underline hover:text-brass-dark">運営者について</Link>、
          データの取得と加工の方法については<Link href="/data-methodology" className="underline hover:text-brass-dark">データの扱い方</Link>もご覧ください。
        </p>

        {SECTIONS.map((s) => (
          <div key={s.heading} className="mt-10">
            <h2 className="mb-4 border-l-4 border-brass pl-3 font-display text-xl text-ink">{s.heading}</h2>
            {s.body.map((para, i) => (
              <p key={i} className="mb-4 text-[15px] leading-[1.9] text-ink-soft">{para}</p>
            ))}
          </div>
        ))}

        <p className="mt-10 text-sm text-ink-soft">
          ご意見・訂正のご連絡は、<Link href="/contact" className="underline hover:text-brass-dark">お問い合わせ</Link>からお願いします。
        </p>
      </section>
    </>
  );
}
