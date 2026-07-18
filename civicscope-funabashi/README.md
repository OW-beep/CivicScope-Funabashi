# CivicScope 船橋（civicscope-funabashi）

船橋市のオープンデータカタログ（[BODIK ODCS](https://odcs.bodik.jp/122041/)）から
「常住人口」「町会・自治会一覧」などのデータをAPI経由で自動取得し、
グラフ・検索表・解説記事として発信するNext.js製サイトです。Vercelでのホスティングを前提にしています。

- サイト名: CivicScope Funabashi（シビックスコープ船橋）
- お問い合わせ: civicscope.funabashi@gmail.com
- データ出典: 船橋市オープンデータカタログ（CC BY 4.0）

---

## 1. ブラウザだけでVercelにデプロイする手順

ローカルにNode.jsやgitを入れなくても、ブラウザだけで以下の手順でデプロイできます。

### Step 1: GitHubにリポジトリを作る
1. https://github.com にログイン（アカウントがなければ作成）。
2. 右上の「+」→「New repository」。リポジトリ名は `civicscope-funabashi` など任意。Public/Privateどちらでも可。「Create repository」をクリック。

### Step 2: このフォルダの中身をアップロードする
1. 作成したリポジトリのページで「uploading an existing file」というリンク（または「Add file」→「Upload files」）をクリック。
2. お渡ししたzipを解凍し、**中のファイル・フォルダをすべて**（`pages`や`components`フォルダごと）ドラッグ＆ドロップでアップロード。
3. 一番下の「Commit changes」をクリックして保存。

   ※ フォルダごとドラッグ＆ドロップすればGitHub側でフォルダ構造を保ったままアップロードされます。うまくいかない場合は、フォルダを1つずつ順番にアップロードしてください。

### Step 3: Vercelでプロジェクトを作る
1. https://vercel.com にログイン（GitHubアカウントでログイン可）。
2. 「Add New...」→「Project」。
3. 先ほどのGitHubリポジトリを選択して「Import」。
4. Framework Presetは自動的に「Next.js」が検出されます。特に設定変更は不要です。
5. 「Environment Variables」の欄は、最初は空のままでOKです（下記3章参照）。
6. 「Deploy」をクリック。数分でビルドが完了し、`https://（プロジェクト名）.vercel.app` のURLでサイトが公開されます。

### Step 4: サイト内のURLを実際のドメインに合わせる
`data/siteConfig.js` の `url` と、`public/robots.txt` の `Sitemap:` 行を、実際に発行されたVercelのURL（または独自ドメイン）に書き換えて、GitHub上でファイルを編集（鉛筆アイコン）→ Commitしてください。Vercelは自動的に再ビルド・再デプロイします。

---

## 2. データセットの差し替え・追加方法

`data/siteConfig.js` の `datasets` に、BODIK ODCSのデータセットID（データセットURLの末尾、例: `122041_maitukijoujyu`）を追加するだけで、`lib/bodik.js` の共通関数がAPI経由で自動的にデータを取得します。CSVの列名を直接指定する必要はありません（列名は正規表現でヒューリスティックに推測しています）。

新しいデータを使ったページを増やしたい場合は、`pages/chokai.js` を参考に、`getDatasetRecords("データセットID")` を`getStaticProps`内で呼び出してください。

---

## 3. Google AdSense審査に向けたチェックリスト

コードは審査を通りやすいように以下を満たす形で用意していますが、申請前に確認・準備してください。

- [x] プライバシーポリシー（`/privacy`）: 広告配信・Cookieについて明記済み
- [x] 利用規約・データ出典（`/terms`）
- [x] 運営者情報・お問い合わせ（`/about`, `/contact`）
- [x] オリジナルの解説記事（`/articles` 配下に3本。今後増やすほど有利です）
- [ ] **独自ドメインの用意を推奨**（`.vercel.app`のままでも審査自体は可能ですが、独自ドメインの方が信頼性の面で有利です）
- [ ] **公開後、ある程度の期間・記事数を積み上げてから申請**するのが一般的です（Googleは低品質・薄いコンテンツを理由に却下することが多いため、記事を10本前後に増やしてからの申請をおすすめします）
- [ ] AdSenseに登録し、審査用の広告コードを取得したら、Vercelの Project Settings → Environment Variables で
      `NEXT_PUBLIC_ADSENSE_CLIENT` に `ca-pub-xxxxxxxxxxxxxxxx` を設定 → Redeploy
- [ ] 審査通過後、AdSense管理画面に表示される`ads.txt`の内容を確認し、`public/ads.txt` を実際のpublisher IDに書き換える
- [ ] 各広告枠（`AdSlot`コンポーネント）に、AdSense管理画面で発行した実際のスロットIDを
      環境変数（`NEXT_PUBLIC_ADSENSE_SLOT_HOME` など、`pages/*.js`内で参照している変数名）として設定する

`NEXT_PUBLIC_ADSENSE_CLIENT` が未設定の間は、広告タグ自体が出力されず、代わりにグレーのプレースホルダー枠が表示されるだけなので、審査前の段階でも安全に運用できます。

---

## 4. ローカルで動作確認したい場合（任意）

Node.js 18以上がある環境で以下を実行すると、ブラウザで `http://localhost:3000` から確認できます（この手順は必須ではありません。Step1〜3のブラウザのみの手順でも問題なく公開できます）。

```bash
npm install
npm run dev
```

---

## ディレクトリ構成

```
civicscope-funabashi/
├─ pages/            # 各ページ（Next.js Pages Router）
│  ├─ index.js        トップページ
│  ├─ dashboard.js     人口ダッシュボード
│  ├─ chokai.js        町会・自治会検索
│  ├─ articles/        解説記事一覧・詳細
│  ├─ about.js / contact.js / privacy.js / terms.js
│  └─ sitemap.xml.js
├─ components/       # UIパーツ
├─ lib/bodik.js      # BODIK ODCS(CKAN) APIクライアント・データ正規化
├─ data/
│  ├─ siteConfig.js   サイト設定・データセットID一覧
│  └─ articles.js     解説記事の本文
├─ styles/globals.css
└─ public/           # robots.txt, ads.txt, favicon.svg
```
