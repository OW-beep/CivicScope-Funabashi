// A8.netのバナー広告コード。ユーザーから提供されたものを、そのまま（1文字も変えずに）保管する。
// 計測用のURL・画像URLを書き換えると成果が計上されなくなるため、ここは編集禁止。
// 表示は components/ArticleBody.jsx の [[A8:id]] ブロック経由でのみ行う。
// 広告であることは表示側で「広告」と明示する（景品表示法・AdSense審査への配慮）。

const banners = {
  hakobu: {
    label: "引っ越し業者を探す",
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4BGSTM+GE0MTE+4HN6+TTDZ5" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www23.a8.net/svt/bgt?aid=261124330991&wid=003&eno=01&mid=s00000020949005008000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BGSTM+GE0MTE+4HN6+TTDZ5" alt="">`,
  },
  trunkroom: {
    label: "トランクルームを探す",
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4BGSTM+GCTRLU+3YJ4+60H7L" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www25.a8.net/svt/bgt?aid=261124330989&wid=003&eno=01&mid=s00000018472001010000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BGSTM+GCTRLU+3YJ4+60H7L" alt="">`,
  },
  arcana: {
    label: "電気の料金プランを見直す",
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4BGSTM+GAG16Q+5HNU+5YZ75" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www24.a8.net/svt/bgt?aid=261124330985&wid=003&eno=01&mid=s00000025617001003000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BGSTM+GAG16Q+5HNU+5YZ75" alt="">`,
  },
};

export default banners;
