import Head from "next/head";
import SectionLabel from "../components/SectionLabel";
import { siteConfig, datasets } from "../data/siteConfig";

export default function Terms() {
  return (
    <>
      <Head>
        <title>{`利用規約・データの出典｜${siteConfig.name}`}</title>
        <meta name="description" content="CivicScope船橋の利用規約と、掲載データの出典・ライセンス一覧。" />
      </Head>

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Terms</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">利用規約・データの出典</h1>

        <div className="mt-10 space-y-10 text-[15px] leading-[1.9] text-ink-soft">
          <div>
            <SectionLabel code="§1">利用規約</SectionLabel>
            <p>
              本サイトのコンテンツ（記事・分析コメント等）は著作権法により保護されています。
              引用の際は出典として本サイト名とURLの明記をお願いいたします。無断での複製・転載はご遠慮ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§2">掲載データの出典一覧</SectionLabel>
            <ul className="list-disc space-y-3 pl-5">
              {Object.values(datasets)
                .filter((d) => d.id)
                .map((d) => (
                  <li key={d.id}>
                    <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
                      {d.label}
                    </a>
                    （船橋市／{siteConfig.bodik.license}）
                  </li>
                ))}
              <li>
                その他、船橋市オープンデータカタログ（
                <a href={siteConfig.bodik.orgCatalogUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
                  {siteConfig.bodik.orgCatalogUrl}
                </a>
                ）に掲載の各種データ
              </li>
              <li>
                町丁目ごとの分布マップの位置情報には、
                <a
                  href="https://github.com/geolonia/japanese-addresses"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-brass-dark"
                >
                  Geolonia 住所データ
                </a>
                （株式会社 Geolonia／CC BY 4.0）を利用しています。
              </li>
              <li>
                分布マップの背景（船橋市の行政境界）には、
                <a
                  href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-brass-dark"
                >
                  国土数値情報（行政区域データ）
                </a>
                （国土交通省）を
                <a
                  href="https://github.com/geolonia/japanese-admins"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-brass-dark"
                >
                  Geoloniaが加工・公開したデータ
                </a>
                を利用しています。
              </li>
            </ul>
            <p className="mt-4">
              これらのデータは{siteConfig.bodik.license}のもとで公開されており、出典を明記することで自由に利用・改変・再配布が可能です。
            </p>
          </div>

          <div>
            <SectionLabel code="§3">免責事項</SectionLabel>
            <p>
              本サイトの分析・可視化・解説記事は編集部による独自の見解であり、船橋市その他関連機関の公式見解を
              示すものではありません。データの正確性・最新性については一次情報（上記出典）を優先してご確認ください。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
