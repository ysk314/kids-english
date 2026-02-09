# 幼児英語アプリ モックアップ（第5週フォーカス）

## 現在の対象
- 第5週「反対言葉のペアを作ろう（絵付き）」に準拠
- 対象画面: 授業ランナー + 大画面フロー（45画面）

## 主要画面
- `screens/03_lesson_runner.html`: 第5週の講師タブレット画面
- `screens/12_jp_rhythm_*.html`: 日本語導入（4画面）
- `screens/13_jp_work_*.html`: 日本語本題ワーク（8画面）
- `screens/14_jp_deep_step_*.html`: 深く考えるステップ（日本語, 4画面）
- `screens/15_jp_deep_compare_*.html`: 深く考える比較（日本語, 4画面）
- `screens/16_en_rhythm_*.html`: 英語導入（4画面）
- `screens/17_en_work_*.html`: 英語本題ワーク（8画面）
- `screens/18_en_deep_step_*.html`: 深く考えるステップ（英語, 4画面）
- `screens/19_en_deep_compare_*.html`: 深く考える比較（英語, 4画面）

## 素材
- `assets/oppositions_cards/`: `oppositions.pdf` から切り出したカード素材
- `assets/deep_think/`: 深く考えるパート用の追加イラスト

## 生成スクリプト
- `mockup/scripts/extract-oppositions-cards.py`: PDFからカードを切り出し
- `mockup/scripts/generate-week5-screens.mjs`: 40画面HTMLを自動生成
- `mockup/scripts/generate-screenshots.mjs`: PNG生成

## 画面イメージ生成
```bash
cd /Users/yasuki/Documents/GitHub/幼児英語
npm install
node ./mockup/scripts/generate-week5-screens.mjs
npm run mockup:capture
```

## 閲覧
- 一覧: `mockup/index.html`
