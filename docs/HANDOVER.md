# 開発引き継ぎメモ（次チャット用）

最終更新: 2026-02-09

## 0. まず読む順番
1. `docs/milestones-and-current-status.md`
2. `docs/development-decision-points.md`
3. `docs/app-requirements.md`
4. `docs/week5-app-architecture.md`
5. `docs/week5-bigscreen-flow.md`

## 1. 現在の到達点
- 第5週（反対語ユニット）は実行可能状態。
- 講師画面 `week5-runner.html` と大画面 `week5-big-screen.html` の同期動作あり。
- スライド構成は 43枚（`11_theme_title` 〜 `20_end`）。
- 正解/不正解音は外部音源（`mockup/assets/audio/*.mp3`）使用。
- 英語スライドは日本語画像を再利用し、画像内英語の重複表示を回避。
- `deep_step` 4枚は1枚ずつ表示（みじかいえんぴつ→ながいえんぴつ→へび→でんしゃ）。
- `deep_compare` はドラム継続（日本語90 / 英語95）。
- エフェクト:
  - 加点時 `みんな +1` / `むつみせんせい +1`
  - 正解 `◯`
  - 不正解 `×`
  - End: 得点発表 + 花吹雪風演出
  - 大画面と授業ランナー内プレビュー両方で表示

## 2. 重要な運用ルール（確定）
- 授業進行は 1問単位で `前へ / 次へ`。
- タイマーは 45分全体のみ。
- 点数リセット操作あり。
- 日本語パートはひらがな中心表示。
- 英語パートは英語表示。
- 毎週ミッションは非表示（MVP対象外）。

## 3. 主要ファイル
仕様:
- 要件: `docs/app-requirements.md`
- フロー: `docs/week5-bigscreen-flow.md`
- 実装構成: `docs/week5-app-architecture.md`
- 導入辞書: `docs/intro-gesture-dictionary.md`

実装コード:
- `src/week5/lessonData.js`
- `src/week5/runner.js`
- `src/week5/big-screen.js`
- `src/week5/audioEngine.js`
- `src/week5/sessionBus.js`
- `src/week5/styles.css`

## 4. GitHub Pages
- workflow: `.github/workflows/deploy-pages.yml`
- ビルドコマンド: `npm run week5:build:pages`
- `main` へ push で自動デプロイ。

## 5. ローカル確認
```bash
cd /Users/yasuki/Documents/GitHub/幼児英語
npm install
npm run week5:dev -- --host 0.0.0.0 --port 4173
```

- `http://localhost:4173/week5-runner.html`
- `http://localhost:4173/week5-big-screen.html`

## 6. テスト
```bash
npm run test:week5
```

## 7. 次タスク候補
- Week6以降のスライドデータ投入
- カードスタジオ連携（カード編集→授業反映）
- 教室設定画面の実装を第5週実装へ接続
- `docs/NEXT_AGENT_PROMPT.md` を使った引き継ぎ運用
