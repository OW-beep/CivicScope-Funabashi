// セクション見出し。code（例: "01"）を、単なる文字ではなく丸みのあるカラーピルで表示し、
// カテゴリ（category）を指定するとそのカテゴリカラーで色分けできる（未指定時はブランドカラーの brass）。
const TONE_CLASSES = {
  brass: "bg-brass text-white",
  life: "bg-category-life text-white",
  kids: "bg-category-kids text-white",
  town: "bg-category-town text-white",
  transit: "bg-category-transit text-white",
  safety: "bg-category-safety text-white",
  social: "bg-category-social text-white"
};

export default function SectionLabel({ code, category, children }) {
  const toneClass = TONE_CLASSES[category] || TONE_CLASSES.brass;

  return (
    <div className="mb-5 flex items-center gap-3">
      {code ? (
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold ${toneClass}`}
        >
          {code}
        </span>
      ) : null}
      <h2 className="font-display text-xl font-bold text-ink md:text-2xl">{children}</h2>
    </div>
  );
}
