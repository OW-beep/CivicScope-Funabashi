import Head from "next/head";
import SectionLabel from "../components/SectionLabel";
import { siteConfig } from "../data/siteConfig";

export default function About() {
  return (
    <>
      <Head>
        <title>{`About｜${siteConfig.name}`}</title>
        <meta name="description" content="CivicScope船橋の運営方針、データの出典、免責事項について。" />
      </Head>

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">About</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">CivicScope船橋について</h1>

        <div className="mt-10 space-y-10 text-[15px] leading-[1.9] text-ink-soft">
          <div>
            <SectionLabel code="§1">サイトの目的</SectionLabel>
            <p>
              CivicScope（シビックスコープ）船橋は、船橋市が公開するオープンデータをもとに、
              人口動向や地域情報を独自に整理・可視化して発信する非公式の市民向けデータメディアです。
              「civic（市民の）」と「scope（観測する道具）」を掛け合わせ、行政データという望遠鏡を通して
              まちの姿を眺める、という意味を込めて名付けました。
            </p>
            <p className="mt-4">
              本サイトは船橋市および関連機関が運営する公式サイトではありません。行政手続きや制度の詳細については、
              必ず船橋市の公式サイト・窓口をご確認ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§2">運営者について</SectionLabel>
            <p>
              運営者は、かつて地方自治体の職員として行政のDX推進やオープンデータの利活用推進に携わっていました。
              統計や行政データが「公開」されてはいても、専門的な様式のまま担当課の引き出しの中に留まり、
              本来それを必要としている市民や事業者のもとには届いていない――そうした現場をいくつも見てきたことが、
              このサイトを立ち上げた原点になっています。せっかく作られたデータが、誰にも開かれないまま眠っているのは、
              あまりにもったいないと感じていました。
            </p>
            <p className="mt-4">
              その後、データサイエンティストとしてIT企業でのコンサルティング業務に従事し、データ分析・可視化を通じて
              企業や自治体の意思決定を支援する仕事に携わってきました。行政の内側でデータが作られる現場と、
              外側でデータを読み解き意思決定に活かす現場の両方を見てきた経験から、「公開されたデータを、実際に
              価値のある形に翻訳する」ことに強い関心を持っています。
            </p>
            <p className="mt-4">
              船橋市は運営者にとって縁の深い、なじみのあるまちです。人口動態や防災情報といった暮らしに直結する
              データはもちろん、梨畑が広がる田園風景から大型商業施設が並ぶ湾岸エリアまで、まちの多様な魅力についても
              あわせて発信していきたいと考えています。CivicScope船橋は、データという少し無機質に見える切り口を通じて、
              船橋というまちをより解像度高く、そして少し愛着を持って眺めてもらうためのメディアを目指しています。
            </p>
          </div>

          <div>
            <SectionLabel code="§3">データの出典・ライセンス</SectionLabel>
            <p>
              本サイトで扱うデータは、
              <a href={siteConfig.bodik.orgCatalogUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
                船橋市オープンデータカタログ（BODIK ODCS）
              </a>
              にて{siteConfig.bodik.license}のもとで公開されている二次利用可能なデータです。
              ライセンスの詳細は
              <a href={siteConfig.bodik.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
                クリエイティブ・コモンズ 表示4.0国際
              </a>
              をご参照ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§4">分析・可視化の方針</SectionLabel>
            <p>
              グラフ化にあたっては、原データの列構成や定義をできる限りそのまま尊重し、
              前月比・前年同月比などの補助的な指標を自動計算して付加しています。
              コメント・解説記事は編集部による独自の見解であり、船橋市の公式見解ではありません。
              誤りを見つけた場合は、お問い合わせページよりご連絡いただけますと幸いです。
            </p>
          </div>

          <div>
            <SectionLabel code="§5">免責事項</SectionLabel>
            <p>
              本サイトに掲載する情報の正確性・完全性・最新性については万全を期していますが、
              保証するものではありません。本サイトの情報を利用したことにより生じた損害について、
              運営者は一切の責任を負いかねます。重要な判断を行う際は、必ず一次情報をご確認ください。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
