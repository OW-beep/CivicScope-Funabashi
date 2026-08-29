/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // ベースカラー。旧デザイン（測量・台帳イメージ）から、
        // 船橋の梨・東京湾・まちの賑わいをイメージした明るいトーンに更新。
        ink: {
          DEFAULT: "#26313B",
          light: "#34424E",
          soft: "#56636F"
        },
        paper: {
          DEFAULT: "#FFF8ED",
          dark: "#FFEFD6"
        },
        // 「brass」= 船橋の特産品・梨をイメージしたゴールド（旧: 落ち着いた真鍮色 → 明るいはちみつ色に）
        brass: {
          DEFAULT: "#E0932A",
          light: "#F3BE6B",
          dark: "#B8721A"
        },
        // 「bay」= 東京湾・三番瀬をイメージしたティール（旧よりも彩度を上げて親しみやすく）
        bay: {
          DEFAULT: "#2AA7A2",
          light: "#6FC4C0",
          dark: "#1D7A76"
        },
        // カテゴリカラー：ダッシュボードの分野ごとに色分けし、タグ的に使う。
        // 船橋市で実際に使われているイメージカラーに合わせて選定：
        // 「青（南部・三番瀬の海）」「赤紫（人々の心・愛や優しさ）」
        // 「えんじ（発達した商工業の豊かさ・成熟）」「緑（北部の里山・自然）」の
        // 4色（地域おこし協議会等で使われる配色）に、ひまわり・サザンカなど
        // 市の花木にちなんだ色を組み合わせている。
        category: {
          life: { DEFAULT: "#8C3A42", light: "#E7C4C8", dark: "#5F262C" }, // 人口・くらし＝えんじ色（商工業の豊かさ・成熟）
          kids: { DEFAULT: "#EFAE1C", light: "#FBE29B", dark: "#B87F0A" }, // 子育て・教育＝ひまわり色（市にゆかりの黄色い花）
          town: { DEFAULT: "#5B9A4F", light: "#D6E8C9", dark: "#3D6B34" }, // まち・環境＝緑（北部の里山・自然）
          transit: { DEFAULT: "#2E74B5", light: "#C3DAF0", dark: "#1D4E7D" }, // 交通＝青（南部・三番瀬の海）
          safety: { DEFAULT: "#D9435C", light: "#F6C7D0", dark: "#A82C41" }, // 安全・衛生＝サザンカ色（市の花木にちなむ紅色）
          social: { DEFAULT: "#9C3B7A", light: "#E8C7DC", dark: "#6E2557" } // 社会参画＝赤紫色（人々の心・愛や優しさ）
        }
      },
      fontFamily: {
        // <link>タグで読み込んだGoogle Fonts「M PLUS Rounded 1c」を直接指定
        // （pages/_document.js参照）。next/fontのCSS変数は使っていない。
        display: ['"M PLUS Rounded 1c"', "var(--font-noto)", "sans-serif"],
        body: ["var(--font-noto)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        pop: "0 8px 24px -8px rgba(38, 49, 59, 0.18)",
        "pop-brass": "0 10px 24px -8px rgba(224, 147, 42, 0.35)",
        "pop-bay": "0 10px 24px -8px rgba(42, 167, 162, 0.35)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(38,49,59,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(38,49,59,0.06) 1px, transparent 1px)",
        dots: "radial-gradient(currentColor 1.5px, transparent 1.5px)"
      },
      backgroundSize: {
        grid: "28px 28px",
        dots: "18px 18px"
      }
    }
  },
  plugins: []
};
