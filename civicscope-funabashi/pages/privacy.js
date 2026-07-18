import Head from "next/head";
import SectionLabel from "../components/SectionLabel";
import { siteConfig } from "../data/siteConfig";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>{`プライバシーポリシー｜${siteConfig.name}`}</title>
        <meta name="description" content="CivicScope船橋のプライバシーポリシー。Cookie・広告配信・アクセス解析について。" />
      </Head>

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Privacy Policy</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">プライバシーポリシー</h1>
        <p className="mt-4 text-sm text-ink-soft">最終更新日：2026年7月18日</p>

        <div className="mt-10 space-y-10 text-[15px] leading-[1.9] text-ink-soft">
          <div>
            <SectionLabel code="§1">運営者情報</SectionLabel>
            <p>
              本サイト「{siteConfig.name}」（以下「本サイト」）は個人による非公式の運営です。
              お問い合わせは
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline hover:text-brass-dark">
                {siteConfig.contactEmail}
              </a>
              までお願いいたします。
            </p>
          </div>

          <div>
            <SectionLabel code="§2">広告の配信について</SectionLabel>
            <p>
              本サイトは、第三者配信の広告サービス（Google AdSenseを含む）を利用する場合があります。
              このような広告配信事業者は、ユーザーの興味に応じた広告を表示するために、Cookie（クッキー）を使用することがあります。
              Cookieを利用することで、本サイトや他のサイトへのアクセス情報に基づいて、適切な広告が表示されます。
            </p>
            <p className="mt-4">
              Googleが広告配信にCookieを使用することにより、ユーザーは本サイトや他のサイトにアクセスした際の情報に
              基づいて、Google及びそのパートナーが適切な広告を表示することができます。
              Cookieを無効にする方法や、Googleによる広告Cookieの使用に関する詳細は、
              <a
                href="https://policies.google.com/technologies/ads?hl=ja"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-brass-dark"
              >
                Googleの広告ポリシー
              </a>
              をご覧ください。
            </p>
          </div>

          <div>
            <SectionLabel code="§3">アクセス解析ツールについて</SectionLabel>
            <p>
              本サイトは、サイトの利用状況を把握するためにGoogle Analytics等のアクセス解析ツールを導入する場合があります。
              このツールはCookieを利用してデータを収集しますが、氏名・住所・メールアドレス・電話番号など、
              個人を特定する情報は含まれません。収集されたデータはGoogleのプライバシーポリシーに基づいて管理されます。
            </p>
          </div>

          <div>
            <SectionLabel code="§4">お問い合わせフォームについて</SectionLabel>
            <p>
              本サイトのお問い合わせは外部のメールサービス（メーラー）を経由します。
              お問い合わせいただいた際にご提供いただく情報は、お問い合わせへの対応の目的以外には利用しません。
            </p>
          </div>

          <div>
            <SectionLabel code="§5">免責事項</SectionLabel>
            <p>
              本サイトからリンクやバナーで移動したサイトで提供される情報、サービス等について、
              本サイトは一切の責任を負いません。また、掲載しているオープンデータの正確性についても万全を期していますが、
              その内容を保証するものではありません。
            </p>
          </div>

          <div>
            <SectionLabel code="§6">プライバシーポリシーの変更について</SectionLabel>
            <p>
              本サイトは、必要に応じて事前の予告なくプライバシーポリシーの内容を変更することがあります。
              変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
