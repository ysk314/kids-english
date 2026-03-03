# 幼児英語 Web App

## 開発サーバー
```bash
npm run week5:dev
```

- Week1 講師ランナー: `/week1/runner.html`
- Week1 大画面表示: `/week1/big-screen.html`
- 講師ランナー: `/week5/runner.html`
- 大画面表示: `/week5/big-screen.html`

## テスト
```bash
npm run test:unit
npm run test:e2e
```

## 補足
- 既存モックは `mockup/` に保持。
- Week5実装方針は `docs/week5-app-architecture.md` を参照。
- Week1日本語スライド生成は `node mockup/scripts/generate-week1-screens.mjs`。
