import { useEffect, useRef } from "react";

// AdSense審査前でも安全に置いておける広告枠。
// NEXT_PUBLIC_ADSENSE_CLIENT が未設定の間は、レイアウト確認用の
// プレースホルダーが表示されるだけで、実際の広告リクエストは発生しません。
export default function AdSlot({ slotId, format = "auto", className = "" }) {
  const insRef = useRef(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 広告ブロッカー等で失敗しても本文表示には影響させない
    }
  }, [client, slotId]);

  if (!client || !slotId) {
    return (
      <div
        className={`flex min-h-[90px] items-center justify-center border border-dashed border-ink/20 bg-ink/5 text-xs text-ink-soft ${className}`}
        aria-hidden="true"
      >
        広告枠（AdSense審査通過後にここへ表示されます）
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
