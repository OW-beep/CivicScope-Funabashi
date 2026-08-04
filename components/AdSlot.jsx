import { useEffect, useRef } from "react";
import { siteConfig } from "../data/siteConfig";

// AdSenseの広告枠。data/siteConfig.js の adsEnabled が false の間は
// 何も描画しない（審査通過前は広告枠自体を出さないため）。
// 審査に通ったら data/siteConfig.js の adsEnabled を true にしてください。
export default function AdSlot({ slotId, format = "auto", className = "" }) {
  const insRef = useRef(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || `ca-${siteConfig.adsensePublisherId}`;
  const enabled = siteConfig.adsEnabled;

  useEffect(() => {
    if (!enabled || !client || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 広告ブロッカー等で失敗しても本文表示には影響させない
    }
  }, [enabled, client, slotId]);

  if (!enabled) {
    return null;
  }

  if (!client || !slotId) {
    return (
      <div
        className={`flex min-h-[90px] items-center justify-center border border-dashed border-ink/20 bg-ink/5 text-xs text-ink-soft ${className}`}
        aria-hidden="true"
      >
        広告枠（AdSense管理画面で広告ユニットのスロットIDを発行後、環境変数に設定するとここに表示されます）
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
