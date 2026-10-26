import Seo from "../components/Seo";
import SectionLabel from "../components/SectionLabel";
import { siteConfig } from "../data/siteConfig";

const link = "underline hover:text-brass-dark";

export default function Privacy() {
  return (
    <>
      <Seo
        title={`プライバシーポリシー｜${siteConfig.name}`}
        description="シビックスコープ船橋のプライバシーポリシー。取得する情報と利用目的、Cookie・広告配信（Google AdSense）・アクセス解析・アフィリエイトの取り扱い、個人情報の管理について。"
        path="/privacy"
      />

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Privacy Policy</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">プライバシーポリシー</h1>
        <p className="mt-4 text-sm text-ink-soft">最終更新日：2026年10月24日</p>

        <div className="mt-10 space-y-10 text-[15px] leading-[1.9] text-ink-soft">
          <div>
            <SectionLabel code="§1">運営者情報</SectionLabel>
            <p>
              本サイト「{siteConfig.nameJa}」（以下「本サイト」）は、個人が運営する非公式の情報サイトです。
              船橋市をはじめ、特定の行政機関・団体とは関係がありません。運営者については
              <a href="/about#operator" className={link}>
                運営者について
              </a>
              をご覧ください。お問い合わせは
              <a href={`mailto:${siteConfig.contactEmail}`} className={link}>
                {siteConfig.contactEmail}
              </a>
              までお願いいたします。
            </p>
          </div>

          <div>
            <SectionLabel code="§2">取得する情報と利用目的</SectionLabel>
            <p>本サイトで取得する情報と、その利用目的は、次のとおりです。</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-bold text-ink">アクセス情報</span>
                ：閲覧したページ、滞在時間、流入元、端末やブラウザの種類、おおよその地域など。
                Cookie（クッキー）などの技術を使って自動的に収集します。サイトの改善と、利用状況の把握のために利用します。
              </li>
              <li>
                <span className="font-bold text-ink">お問い合わせの情報</span>
                ：お問い合わせのメールに書かれた、お名前（任意）、メールアドレス、お問い合わせの内容。
                お問い合わせへの対応のためにだけ利用し、対応に必要な期間を過ぎたものは、適切に削除します。
              </li>
            </ul>
            <p className="mt-3">
              本サイトは、会員登録やコメント投稿の機能を持たず、氏名・住所・電話番号などを、サイトの閲覧者から集めることはしません。
            </p>
          </div>

          <div>
            <SectionLabel code="§3">広告の配信について（Google AdSense）</SectionLabel>
            <p>
              本サイトは、第三者配信の広告サービス「Google AdSense」を利用して、広告を掲載することがあります。
              Googleを含む第三者配信事業者は、Cookieを使用して、ユーザーが本サイトや他のウェブサイトに過去にアクセスした際の情報に基づいて、
              広告を配信します。
            </p>
            <p className="mt-4">
              GoogleがDoubleClick Cookie（広告用のCookie）を使用することで、Googleやそのパートナーは、
              ユーザーが本サイトや他のサイトにアクセスした際の情報に基づいて、適切な広告を表示できます。
            </p>
            <p className="mt-4">
              ユーザーは、次のページで、パーソナライズ広告を無効にできます。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className={link}>
                  Googleの広告設定
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer" className={link}>
                  aboutads.info（第三者配信事業者のCookieを無効にする）
                </a>
              </li>
            </ul>
            <p className="mt-4">
              Googleによる広告Cookieの使用についての詳細は、
              <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noreferrer" className={link}>
                Googleの広告に関するポリシー
              </a>
              をご覧ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§4">アフィリエイトプログラムについて</SectionLabel>
            <p>
              本サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定された
              アフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
              Amazonのアソシエイトとして、{siteConfig.nameJa}は適格販売により収入を得ています。
            </p>
            <p className="mt-4">
              また、楽天アフィリエイトを利用した商品リンクを掲載することがあります。
              これらのリンク経由で商品が購入された場合に、本サイトが紹介料を得ることがあります。
              商品リンクを含む枠には、「PR」と表示します。広告やアフィリエイトの有無で、記事の内容や評価を変えることはありません。
            </p>
          </div>

          <div>
            <SectionLabel code="§5">アクセス解析ツールについて</SectionLabel>
            <p>
              本サイトは、利用状況を把握するために、Googleが提供するアクセス解析ツール「Google アナリティクス」を利用しています。
              このツールは、Cookieを使って、アクセス情報を収集します。収集される情報は、個人を特定するものではありません。
              データの取り扱いは、
              <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noreferrer" className={link}>
                Googleのポリシー
              </a>
              に基づきます。ブラウザの設定でCookieを無効にすることで、収集を拒否できます。
            </p>
          </div>

          <div>
            <SectionLabel code="§6">Cookieについて</SectionLabel>
            <p>
              Cookieは、ブラウザに保存される小さなファイルです。ブラウザの設定で、Cookieの受け入れを無効にできます。
              ただし、無効にすると、本サイトの一部の機能が使えなくなることがあります。
            </p>
          </div>

          <div>
            <SectionLabel code="§7">個人情報の第三者への提供</SectionLabel>
            <p>
              本サイトは、法令に基づく場合を除き、お問い合わせなどでお預かりした個人情報を、ご本人の同意なく、第三者に提供しません。
            </p>
          </div>

          <div>
            <SectionLabel code="§8">免責事項</SectionLabel>
            <p>
              本サイトに掲載する情報は、公的機関が公表する資料をもとに、できる限り正確を期してまとめていますが、
              その内容の正確性や最新性を保証するものではありません。行政の制度・手続き・手数料などは、変更されることがあります。
              実際の手続きの前には、必ず、船橋市などの公式サイトや窓口で、最新の情報をご確認ください。
              本サイトの情報を利用して生じた損害について、運営者は責任を負いません。
              また、本サイトからリンクした外部のサイトで提供される情報・サービスについても、責任を負いません。
            </p>
            <p className="mt-4">
              本サイトの内容は、医療・法律・税務などの、個別の専門的な助言ではありません。
            </p>
          </div>

          <div>
            <SectionLabel code="§9">著作権・データの利用について</SectionLabel>
            <p>
              本サイトの文章・図表の著作権は、運営者に帰属します。出典を明記したうえでの、適切な範囲での引用は、可能です。
              本サイトが加工して利用しているオープンデータの多くは、クリエイティブ・コモンズ 表示4.0（CC BY 4.0）のもとで、
              各機関が公開しているものです。出典とライセンスの詳細は、
              <a href="/about" className={link}>
                サイトについて
              </a>
              と、各記事の出典欄をご覧ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§10">プライバシーポリシーの変更について</SectionLabel>
            <p>
              本サイトは、必要に応じて、このプライバシーポリシーの内容を変更することがあります。
              変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じます。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
