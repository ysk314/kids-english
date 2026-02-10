# 第5週 実装アーキテクチャ（引き継ぎ版）

最終更新: 2026-02-09

## 1. 実装スタック
- フロントエンド: Vite + Vanilla ES Modules
- 実行端末: iPad Safari / Chrome / Desktop Browser
- 通信: 同一ブラウザ内同期（BroadcastChannel + localStorage）

## 2. エントリーポイント
- 講師画面: `week5-runner.html`
- 大画面: `week5-big-screen.html`
- ルート: `index.html`（runnerへ誘導）

## 3. 主要モジュール
- `src/week5/lessonData.js`
  - 49スライド定義
  - フローステップ
  - 授業ねらい
  - 講師ヒント（タイトル/ねらい/セリフ）

- `src/week5/runner.js`
  - 進行制御（前へ/次へ、スライドジャンプ）
  - 講師コントローラー処理
  - タイマー表示
  - 点数リセット
  - 正解/不正解・加点イベント送信

- `src/week5/big-screen.js`
  - スライド受信表示
  - ポイント表示（みんな / むつみ先生）
  - エフェクト表示（+1 / ◯ / ×）
  - End演出（得点発表 + 花吹雪風演出）
  - 全画面切り替え

- `src/week5/audioEngine.js`
  - BGM制御
  - ドラム系メトロノーム（90/95 BPM）
  - 正解/不正解音再生
  - deep_compareスライドでもドラム継続

- `src/week5/sessionBus.js`
  - 状態同期とPresence通知

- `src/week5/styles.css`
  - ランナー/大画面共通と専用スタイル

## 4. データ同期モデル
送信状態（代表）:
- `slideIndex`
- `studentPoints`
- `teacherPoints`
- `bgmEnabled`
- `fxEvent`（`student` `teacher` `correct` `incorrect`）
- `updatedAt`

`fxEvent` はID付きで送信し、受信側で重複抑止する。

## 5. 音仕様
- 正解音: `mockup/assets/audio/correct.mp3`
- 不正解音: `mockup/assets/audio/wrong.mp3`
- 正誤音は外部音源を優先（重複再生防止済み）。

## 6. GitHub Pages対応
- 設定ファイル: `vite.config.mjs`
  - `mode === "gh-pages"` のとき `base: "./"`
- ビルド:
  - 開発ビルド: `npm run week5:build`
  - Pagesビルド: `npm run week5:build:pages`
- デプロイ:
  - `.github/workflows/deploy-pages.yml`
  - `main` pushで自動公開

## 7. ローカル起動
```bash
cd /Users/yasuki/Documents/GitHub/幼児英語
npm install
npm run week5:dev -- --host 0.0.0.0 --port 4173
```

URL:
- `http://localhost:4173/week5-runner.html`
- `http://localhost:4173/week5-big-screen.html`

## 8. テスト
```bash
npm run test:week5
```
- Unit: データ整合性・utility
- E2E: ランナー進行と大画面同期

## 9. 今後の拡張ポイント
- Week6以降のスライドデータ追加
- カードスタジオとのデータ接続
- 本番素材管理（画像/音）運用の固定
