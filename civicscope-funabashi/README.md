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

### Step 4: 独自ドメインを取るとき（あとで／任意）
サイトURLは `https://civic-scope-funabashi.vercel.app` で確定済みです（`data/siteConfig.js`の`url`と`public/robots.txt`にすでに反映済み）。検索流入などが見込めるようになったタイミングで独自ドメインを取得したら、この2箇所を書き換えてGitHub上でCommitしてください。Vercelは自動的に再ビルド・再デプロイします。

---

## 2. データセットの差し替え・追加方法

`data/siteConfig.js` の `datasets` に、BODIK ODCSのデータセットID（データセットURLの末尾、例: `122041_maitukijoujyu`）を追加するだけで、`lib/bodik.js` の共通関数がAPI経由で自動的にデータを取得します。CSVの列名を直接指定する必要はありません（列名は正規表現でヒューリスティックに推測しています）。

新しいデータを使ったページを増やしたい場合は、`pages/chokai.js` を参考に、`getDatasetRecords("データセットID")` を`getStaticProps`内で呼び出してください。

### 町丁目別の分布マップについて

`pages/chokai.js` と `pages/food-businesses.js` は、住所らしき列（`所在地`・`住所`・`町丁目`など）を自動検出し、
[Geolonia 住所データ](https://github.com/geolonia/japanese-addresses)（無料・CC BY 4.0）を使って町丁目名から緯度経度を引き当て、
[Geolonia が公開する行政境界データ](https://github.com/geolonia/japanese-admins)（国土交通省「国土数値情報」をもとに作成）を
背景の輪郭として使い、実際の船橋市域の上にバブルを正確な縮尺でプロットしています。

住所らしき列が見つからない、またはマッチ率が低い場合は、`地区`のような、より粗いカテゴリ列での
ランキング表示に自動でフォールバックします（`pages/chokai.js`はこの二段構えになっており、
どちらも使えない場合のみ一覧表だけの表示になります）。

### 防災ダッシュボード（複数レイヤーの地点マップ）について

`pages/disaster-prevention.js`は、避難場所・避難所・帰宅困難者支援施設のデータセットに
緯度経度の列（`緯度`・`経度`など）が含まれていればそれを使い、施設1件＝地図上の1点として
船橋市の行政境界の上に正確な位置でプロットします（`lib/geo.js`の`guessLatLngFields`/`extractPointsFromLatLng`、
描画は`components/FacilityMap.jsx`）。データセットごとにレイヤーとして重ね合わせ、
チェックボックスで表示・非表示を切り替えられます。同じ仕組みは、緯度経度を持つ
他の施設データを追加する際にも再利用できます（`data/siteConfig.js`の`datasets`に追加するだけです）。

「区分」のような分類列が「1」「不明」のようなコードで読み取りにくい場合に備えて、
`guessCategoryField`は実際の値を見て、数字コードだけの列は後回しにするようにしています。
また、避難場所・避難所データは「洪水」「地震」「津波」のように災害種別ごとの対応可否フラグを
持つ形式（内閣官房の指定緊急避難場所データ標準に準拠）であることが多いため、
`buildHazardBreakdown`でこれらのフラグ列を自動検出し、災害種別ごとの対応件数として
集計・グラフ化しています（単一のコード化された「区分」列より読み取りやすい切り口です）。

**AEDデータについて**：船橋市の場合、AED設置施設一覧はBODIK ODCS（data.bodik.jp）ではなく
「G空間情報センター」という別カタログに掲載されており、そのサイトはロボット除け設定のため
自動で正確なデータセットIDを確認できませんでした。`data/siteConfig.js`の`datasets.aed`に
`id`（データセットのURL末尾）を設定すれば、既存の仕組みでそのまま取り込めます
（`apiBase`も忘れずに設定してください）。IDが空の間、防災ダッシュボードにはAEDレイヤーが
表示されず、その旨の案内と船橋市公式のAEDマップへのリンクが表示されます。

**地図の細かさについて**：現在の地図は国土数値情報（国土交通省）による市全体の行政境界のみを
使っており、町丁目や番地ごとの細かい境界線・クリックで色を塗るような塗り分け表示（コロプレス図）は
対応していません。町丁目単位の詳細な境界ポリゴンデータ（e-Statの小地域境界データなど）を
別途用意できれば同様の仕組みで実装できますが、無料で確実に使える出典を確認できていないため、
今回は見送っています。該当するデータソースが見つかれば教えてください。

---

## 3. Google AdSense審査に向けたチェックリスト

コードは審査を通りやすいように以下を満たす形で用意していますが、申請前に確認・準備してください。

- [x] プライバシーポリシー（`/privacy`）: 広告配信・Cookieについて明記済み
- [x] 利用規約・データ出典（`/terms`）
- [x] 運営者情報・お問い合わせ（`/about`, `/contact`）
- [x] オリジナルの解説記事（`/articles` 配下に5本。今後増やすほど有利です）
- [x] AdSenseクライアントID（`ca-pub-4630812027939211`）を`data/siteConfig.js`に設定し、`pages/_document.js`のHead内に静的な`<script>`タグとして直接埋め込み済み（すべてのページの初期HTMLに含まれます）
- [x] Google Search Console用の`google-site-verification`メタタグを`pages/_document.js`に設定済み
- [x] `public/ads.txt`にpublisher ID（`pub-4630812027939211`）を設定済み
- [ ] **審査に通るまでは広告枠は非表示**にしてあります（`data/siteConfig.js`の`adsEnabled: false`）。審査確認用の`<script>`タグ（`_document.js`）自体は常に出力されますが、`AdSlot`コンポーネントは`adsEnabled`が`false`の間は何も描画しません。**審査に通ったら`adsEnabled`を`true`に書き換えてください。**
- [ ] **独自ドメインの用意を推奨**（`.vercel.app`のままでも審査自体は可能ですが、独自ドメインの方が信頼性の面で有利です。検索流入が見込めると判断した時点で取得し、`data/siteConfig.js`の`url`と`public/robots.txt`のSitemap行を書き換えてください）
- [ ] **公開後、ある程度の期間・記事数を積み上げてから申請**するのが一般的です（Googleは低品質・薄いコンテンツを理由に却下することが多いため、記事を10本前後に増やしてからの申請をおすすめします）
- [ ] 審査通過後、各広告枠（`AdSlot`コンポーネント）の表示位置をAdSense管理画面の自動広告設定に任せるか、
      個別のスロットIDを環境変数（`NEXT_PUBLIC_ADSENSE_SLOT_HOME` など、`pages/*.js`内で参照している変数名）として設定する

別のAdSenseアカウント・クライアントIDに差し替えたい場合は、`data/siteConfig.js`の`adsensePublisherId`を書き換えてください（`pages/_document.js`が自動的にこの値を使います）。

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
