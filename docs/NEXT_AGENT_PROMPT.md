# 次エージェント開始用プロンプト

以下を次のチャットで最初に貼って開始してください。

---
このリポジトリ `/Users/yasuki/Documents/GitHub/幼児英語` の開発を引き継いでください。

まず以下のドキュメントを順に読み、現状を把握してから作業に入ってください。
1. `/Users/yasuki/Documents/GitHub/幼児英語/docs/HANDOVER.md`
2. `/Users/yasuki/Documents/GitHub/幼児英語/docs/milestones-and-current-status.md`
3. `/Users/yasuki/Documents/GitHub/幼児英語/docs/development-decision-points.md`
4. `/Users/yasuki/Documents/GitHub/幼児英語/docs/app-requirements.md`
5. `/Users/yasuki/Documents/GitHub/幼児英語/docs/week5-app-architecture.md`
6. `/Users/yasuki/Documents/GitHub/幼児英語/docs/week5-bigscreen-flow.md`

必須前提:
- 第5週は49枚構成。
- 進行は1問ごと前後移動。
- 日本語パートはひらがな中心、英語パートは英語のみ。
- 正解/不正解音は `mockup/assets/audio/correct.mp3`, `mockup/assets/audio/wrong.mp3` を使用。
- エフェクトは大画面と授業ランナープレビュー両方で表示。
- GitHub Pages配信を壊さないこと。

作業開始時に、次を出してください。
1. 読んだ内容の要約（決定事項・未決事項）
2. 現在地（どのマイルストーンか）
3. 今日やる実装タスクの短い計画（3〜5項目）
4. 変更後に実行する確認コマンド
   - `npm run test:week5`
   - 必要に応じて `npm run week5:build:pages`

注意:
- 既存決定事項を勝手に変更しない。変更が必要なら論点として明示して合意を取る。
- iPad運用と大画面可読性を優先する。
---
