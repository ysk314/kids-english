# 第5週 実アプリ構成（iPadブラウザ運用）

## 1. 採用構成
- フロントエンド: Webブラウザ（Vite + Vanilla ES Modules）
- 画面:
  - `week5-runner.html`（講師タブレット）
  - `week5-big-screen.html`（大画面表示）
- 同期方式:
  - `BroadcastChannel`（同時起動タブ/ウィンドウ同期）
  - `localStorage`（フォールバック同期 + 再読み込み復元）
- 音:
  - Web Audio API（BGM / メトロノーム / 効果音）

## 2. なぜこの構成か
- iPadのSafariで即時運用できる（アプリインストール不要）。
- ミラー用途でも、別画面用途でも同じコードで扱える。
- Week5の40画面をそのまま使い、見た目の差分を最小化できる。
- 後続週も `src/week5/lessonData.js` 相当のデータ追加で拡張しやすい。

## 3. 実装モジュール
- `src/week5/lessonData.js`
  - 40スライド順序
  - フローステップ
  - 授業ねらい
  - 講師ヒント（タイトル/ねらい/セリフ）
- `src/week5/sessionBus.js`
  - Runner ↔ Big Screen 同期
- `src/week5/audioEngine.js`
  - BGM / BPM90-95メトロノーム / 効果音
- `src/week5/runner.js`
  - 進行操作（前/次、加点）
  - 講師ヒント表示
  - 45分タイマー表示
- `src/week5/big-screen.js`
  - 現在スライドの受信表示
  - 接続ハートビート（Mirror Connected）

## 4. 現時点の適用範囲
- 第5週のみ（45スライド一式。区切りスライドを含む）
- 要件反映済み:
  - 1問ごと進行
  - 生徒/講師ポイント加算
  - 導入4セット固定
  - 日本語導入90BPM / 英語導入95BPM
  - 対戦クイズなし
  - 講師ヒント40件

## 5. 起動
```bash
cd /Users/yasuki/Documents/GitHub/幼児英語
npm install
npm run week5:dev
```
- 講師画面: `http://127.0.0.1:5173/week5-runner.html`
- 大画面: `http://127.0.0.1:5173/week5-big-screen.html`

## 6. テスト
```bash
npm run test:unit
npm run test:e2e
```
