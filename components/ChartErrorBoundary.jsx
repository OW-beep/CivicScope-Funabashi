import { Component } from "react";

// ダッシュボードのグラフ・地図はオープンデータの実際の列構成に依存しており、
// 想定外のデータ形状が来た場合に描画中の例外でページ全体がクラッシュしないよう、
// このコンポーネントで囲んで被害を最小限にする。
export default class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 開発時にコンソールで原因を追えるように出力しておく
    // eslint-disable-next-line no-console
    console.error("Chart rendering error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="border border-dashed border-ink/20 bg-ink/5 p-4 text-sm text-ink-soft">
          {this.props.fallbackMessage ||
            "このグラフ・地図は現在表示できません（データ形式を確認中です）。しばらくしてから再度お試しください。"}
        </p>
      );
    }
    return this.props.children;
  }
}
