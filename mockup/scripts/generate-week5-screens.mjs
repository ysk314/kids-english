import fs from "node:fs";
import path from "node:path";

const screensDir = "/Users/yasuki/Documents/GitHub/幼児英語/mockup/screens";

const JP_PAIRS = [
  {
    leftWord: "ながい",
    rightWord: "みじかい",
    leftImg: "../assets/oppositions_cards/long_jp.png",
    rightImg: "../assets/oppositions_cards/short_jp.png"
  },
  {
    leftWord: "きれい",
    rightWord: "きたない",
    leftImg: "../assets/oppositions_cards/clean_jp.png",
    rightImg: "../assets/oppositions_cards/dirty_jp.png"
  },
  {
    leftWord: "あかるい",
    rightWord: "くらい",
    leftImg: "../assets/oppositions_cards/bright_jp.png",
    rightImg: "../assets/oppositions_cards/dark_jp.png"
  },
  {
    leftWord: "たつ",
    rightWord: "すわる",
    leftImg: "../assets/oppositions_cards/stand_up_jp.png",
    rightImg: "../assets/oppositions_cards/sit_down_jp.png"
  }
];

const EN_PAIRS = [
  {
    leftWord: "long",
    rightWord: "short",
    leftImg: "../assets/oppositions_cards/long_jp.png",
    rightImg: "../assets/oppositions_cards/short_jp.png"
  },
  {
    leftWord: "clean",
    rightWord: "dirty",
    leftImg: "../assets/oppositions_cards/clean_jp.png",
    rightImg: "../assets/oppositions_cards/dirty_jp.png"
  },
  {
    leftWord: "bright",
    rightWord: "dark",
    leftImg: "../assets/oppositions_cards/bright_jp.png",
    rightImg: "../assets/oppositions_cards/dark_jp.png"
  },
  {
    leftWord: "stand up",
    rightWord: "sit down",
    leftImg: "../assets/oppositions_cards/stand_up_jp.png",
    rightImg: "../assets/oppositions_cards/sit_down_jp.png"
  }
];

const JP_QUESTIONS = [
  {
    targetWord: "ながい",
    targetImg: "../assets/oppositions_cards/long_jp.png",
    options: [
      { text: "みじかい", img: "../assets/oppositions_cards/short_jp.png", correct: true },
      { text: "あかるい", img: "../assets/oppositions_cards/bright_jp.png", correct: false }
    ]
  },
  {
    targetWord: "みじかい",
    targetImg: "../assets/oppositions_cards/short_jp.png",
    options: [
      { text: "ながい", img: "../assets/oppositions_cards/long_jp.png", correct: true },
      { text: "くらい", img: "../assets/oppositions_cards/dark_jp.png", correct: false }
    ]
  },
  {
    targetWord: "きれい",
    targetImg: "../assets/oppositions_cards/clean_jp.png",
    options: [
      { text: "きたない", img: "../assets/oppositions_cards/dirty_jp.png", correct: true },
      { text: "たつ", img: "../assets/oppositions_cards/stand_up_jp.png", correct: false }
    ]
  },
  {
    targetWord: "きたない",
    targetImg: "../assets/oppositions_cards/dirty_jp.png",
    options: [
      { text: "きれい", img: "../assets/oppositions_cards/clean_jp.png", correct: true },
      { text: "すわる", img: "../assets/oppositions_cards/sit_down_jp.png", correct: false }
    ]
  },
  {
    targetWord: "あかるい",
    targetImg: "../assets/oppositions_cards/bright_jp.png",
    options: [
      { text: "くらい", img: "../assets/oppositions_cards/dark_jp.png", correct: true },
      { text: "みじかい", img: "../assets/oppositions_cards/short_jp.png", correct: false }
    ]
  },
  {
    targetWord: "くらい",
    targetImg: "../assets/oppositions_cards/dark_jp.png",
    options: [
      { text: "あかるい", img: "../assets/oppositions_cards/bright_jp.png", correct: true },
      { text: "ながい", img: "../assets/oppositions_cards/long_jp.png", correct: false }
    ]
  },
  {
    targetWord: "たつ",
    targetImg: "../assets/oppositions_cards/stand_up_jp.png",
    options: [
      { text: "すわる", img: "../assets/oppositions_cards/sit_down_jp.png", correct: true },
      { text: "きれい", img: "../assets/oppositions_cards/clean_jp.png", correct: false }
    ]
  },
  {
    targetWord: "すわる",
    targetImg: "../assets/oppositions_cards/sit_down_jp.png",
    options: [
      { text: "たつ", img: "../assets/oppositions_cards/stand_up_jp.png", correct: true },
      { text: "きたない", img: "../assets/oppositions_cards/dirty_jp.png", correct: false }
    ]
  }
];

const EN_QUESTIONS = [
  {
    targetWord: "long",
    targetImg: "../assets/oppositions_cards/long_jp.png",
    options: [
      { text: "short", img: "../assets/oppositions_cards/short_jp.png", correct: true },
      { text: "bright", img: "../assets/oppositions_cards/bright_jp.png", correct: false }
    ]
  },
  {
    targetWord: "short",
    targetImg: "../assets/oppositions_cards/short_jp.png",
    options: [
      { text: "long", img: "../assets/oppositions_cards/long_jp.png", correct: true },
      { text: "dark", img: "../assets/oppositions_cards/dark_jp.png", correct: false }
    ]
  },
  {
    targetWord: "clean",
    targetImg: "../assets/oppositions_cards/clean_jp.png",
    options: [
      { text: "dirty", img: "../assets/oppositions_cards/dirty_jp.png", correct: true },
      { text: "stand up", img: "../assets/oppositions_cards/stand_up_jp.png", correct: false }
    ]
  },
  {
    targetWord: "dirty",
    targetImg: "../assets/oppositions_cards/dirty_jp.png",
    options: [
      { text: "clean", img: "../assets/oppositions_cards/clean_jp.png", correct: true },
      { text: "sit down", img: "../assets/oppositions_cards/sit_down_jp.png", correct: false }
    ]
  },
  {
    targetWord: "bright",
    targetImg: "../assets/oppositions_cards/bright_jp.png",
    options: [
      { text: "dark", img: "../assets/oppositions_cards/dark_jp.png", correct: true },
      { text: "short", img: "../assets/oppositions_cards/short_jp.png", correct: false }
    ]
  },
  {
    targetWord: "dark",
    targetImg: "../assets/oppositions_cards/dark_jp.png",
    options: [
      { text: "bright", img: "../assets/oppositions_cards/bright_jp.png", correct: true },
      { text: "long", img: "../assets/oppositions_cards/long_jp.png", correct: false }
    ]
  },
  {
    targetWord: "stand up",
    targetImg: "../assets/oppositions_cards/stand_up_jp.png",
    options: [
      { text: "sit down", img: "../assets/oppositions_cards/sit_down_jp.png", correct: true },
      { text: "clean", img: "../assets/oppositions_cards/clean_jp.png", correct: false }
    ]
  },
  {
    targetWord: "sit down",
    targetImg: "../assets/oppositions_cards/sit_down_jp.png",
    options: [
      { text: "stand up", img: "../assets/oppositions_cards/stand_up_jp.png", correct: true },
      { text: "dirty", img: "../assets/oppositions_cards/dirty_jp.png", correct: false }
    ]
  }
];

const DEEP_ITEMS_JP = [
  { label: "みじかいえんぴつ", img: "../assets/deep_think/pencil_short_tiny.svg" },
  { label: "ながいえんぴつ", img: "../assets/deep_think/pencil_long.png" },
  { label: "へび", img: "../assets/deep_think/snake_long.png" },
  { label: "でんしゃ", img: "../assets/deep_think/train_long.svg" }
];

const DEEP_ITEMS_EN = [
  { label: "short pencil", img: "../assets/deep_think/pencil_short_tiny.svg" },
  { label: "long pencil", img: "../assets/deep_think/pencil_long.png" },
  { label: "snake", img: "../assets/deep_think/snake_long.png" },
  { label: "train", img: "../assets/deep_think/train_long.svg" }
];

function progressDots(count, active) {
  return `<div class="flow-progress">${Array.from(
    { length: count },
    (_, i) => `<span class="${i <= active ? "on" : ""}"></span>`
  ).join("")}</div>`;
}

function pageShell({ title, mode, heading, body, extraClass = "", bodyClass = "" }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="../shared.css">
  </head>
  <body>
    <main class="bigscreen ${mode}${extraClass ? ` ${extraClass}` : ""}">
      <h1>${heading}</h1>
      <section class="slide-body ${bodyClass}">${body}</section>
    </main>
  </body>
</html>`;
}

function renderDivider({ mode, title, subtitle }) {
  const body = `
    <div class="divider-card">
      <p>${title}</p>
      <strong>${subtitle}</strong>
    </div>
  `;

  return pageShell({
    title,
    mode,
    heading: mode === "en" ? "Get Ready" : "つぎへ すすもう",
    body
  });
}

function renderEnd() {
  const body = `
    <div class="divider-card end-card">
      <p>End</p>
      <strong>Great Job!</strong>
      <span>See you next lesson!</span>
    </div>
  `;

  return pageShell({
    title: "end",
    mode: "en",
    heading: "See you next time!",
    body
  });
}

function renderThemeTitle() {
  const pairs = JP_PAIRS.map(
    (pair) => `
      <div class="pair-summary-item">
        <img src="${pair.leftImg}" alt="${pair.leftWord}">
        <span>${pair.leftWord}</span>
        <b>↔</b>
        <img src="${pair.rightImg}" alt="${pair.rightWord}">
        <span>${pair.rightWord}</span>
      </div>`
  ).join("");

  const body = `
      <div class="theme-title-card">
        <strong>きょうの てーま</strong>
        <p>はんたいことばを たのしく みつけよう！</p>
      </div>
      <div class="pair-summary-grid">${pairs}</div>
  `;

  return pageShell({
    title: "today theme",
    mode: "jp",
    heading: "だい5しゅう はんたいことば",
    body,
    bodyClass: "body-theme"
  });
}

function renderRhythmSummary(pairs, mode) {
  const rows = pairs
    .map(
      (pair) => `
      <div class="pair-summary-item">
        <img src="${pair.leftImg}" alt="${pair.leftWord}">
        <span>${pair.leftWord}</span>
        <b>↔</b>
        <img src="${pair.rightImg}" alt="${pair.rightWord}">
        <span>${pair.rightWord}</span>
      </div>`
    )
    .join("");

  const body = `
      ${progressDots(5, 4)}
      <div class="pair-summary-grid">${rows}</div>
  `;

  return pageShell({
    title: "rhythm summary",
    mode,
    heading: mode === "en" ? "All 4 Rhythm Pairs" : "4せっと まとめ",
    body,
    bodyClass: "body-rhythm-summary"
  });
}

function renderRhythm(pair, idx, mode) {
  const body = `
      ${progressDots(4, idx)}
      <div class="focus-pair compact">
        <div class="focus-card compact">
          <img src="${pair.leftImg}" alt="${pair.leftWord}">
          <div class="label">${pair.leftWord}</div>
        </div>
        <div class="connector">↔</div>
        <div class="focus-card compact">
          <img src="${pair.rightImg}" alt="${pair.rightWord}">
          <div class="label">${pair.rightWord}</div>
        </div>
      </div>
  `;

  return pageShell({
    title: `rhythm ${idx + 1}`,
    mode,
    heading: `${pair.leftWord} / ${pair.rightWord}`,
    body,
    bodyClass: "body-rhythm"
  });
}

function renderWork(q, idx, mode) {
  const options = q.options
    .map(
      (opt) => `
      <div class="option-card">
        <img src="${opt.img}" alt="${opt.text}">
        <div class="txt">${opt.text}</div>
      </div>`
    )
    .join("");

  const body = `
      ${progressDots(8, idx)}
      <div class="main-choice compact">
        <section class="target-large compact">
          <img src="${q.targetImg}" alt="${q.targetWord}">
          <div class="title">${q.targetWord}</div>
        </section>
        <section class="option-panel compact">
          <div class="option-stack">${options}</div>
        </section>
      </div>
  `;

  return pageShell({
    title: `work ${idx + 1}`,
    mode,
    heading: mode === "en" ? `Which is opposite to ${q.targetWord}?` : `${q.targetWord} の はんたいは どっち？`,
    body,
    bodyClass: "body-work"
  });
}

function renderDeepStep(idx, mode, items) {
  const item = items[idx];
  const cards = `
      <div class="focus-card compact deep-card">
        <img src="${item.img}" alt="${item.label}">
        <div class="label">${item.label}</div>
      </div>`;

  const body = `
      ${progressDots(4, idx)}
      <div class="focus-pair compact deep-seq deep-single">
        ${cards}
      </div>
  `;

  return pageShell({
    title: `deep step ${idx + 1}`,
    mode,
    heading: mode === "en" ? "Is this long?" : "これは ながい？",
    body,
    bodyClass: "body-deep-step"
  });
}

function renderDeepCompare(idx, pair, mode, items) {
  const grid = items
    .map((item, i) => {
      const high = pair.includes(i) ? "highlight" : "";
      return `
      <div class="deep-item ${high}">
        <img src="${item.img}" alt="${item.label}">
        <div class="label">${item.label}</div>
      </div>`;
    })
    .join("");

  const body = `
      ${progressDots(4, idx)}
      <div class="deep-board compact">
        <div class="deep-grid">${grid}</div>
      </div>
  `;

  return pageShell({
    title: `deep compare ${idx + 1}`,
    mode,
    heading: mode === "en" ? "Compare two cards!" : "ふたつを くらべよう！",
    body,
    bodyClass: "body-deep-compare"
  });
}

function renderEnStartBreak() {
  const body = `
    <div class="divider-card split-card">
      <p>日本語パートは これで おしまい！</p>
      <strong>English Part Start!</strong>
    </div>
  `;

  return pageShell({
    title: "English Part Start!",
    mode: "en",
    heading: "Get Ready",
    body,
    extraClass: "mix",
    bodyClass: "body-divider"
  });
}

function write(name, html) {
  fs.writeFileSync(path.join(screensDir, name), html, "utf8");
}

function generate() {
  write("11_theme_title.html", renderThemeTitle());

  JP_PAIRS.forEach((pair, idx) => write(`12_jp_rhythm_${idx + 1}.html`, renderRhythm(pair, idx, "jp")));
  write("12_jp_rhythm_summary.html", renderRhythmSummary(JP_PAIRS, "jp"));
  write(
    "12_jp_break_work.html",
    renderDivider({ mode: "jp", title: "つぎは えらぶ もんだい", subtitle: "じゅんび できた？" })
  );

  JP_QUESTIONS.forEach((q, idx) => write(`13_jp_work_${idx + 1}.html`, renderWork(q, idx, "jp")));
  write(
    "13_jp_break_deep.html",
    renderDivider({ mode: "jp", title: "ふかく かんがえよう！", subtitle: "くらべると みえかたが かわる" })
  );

  DEEP_ITEMS_JP.forEach((_, idx) => write(`14_jp_deep_step_${idx + 1}.html`, renderDeepStep(idx, "jp", DEEP_ITEMS_JP)));

  const comparePairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 3]
  ];

  comparePairs.forEach((pair, idx) =>
    write(`15_jp_deep_compare_${idx + 1}.html`, renderDeepCompare(idx, pair, "jp", DEEP_ITEMS_JP))
  );

  write("15_break_en_start.html", renderEnStartBreak());

  EN_PAIRS.forEach((pair, idx) => write(`16_en_rhythm_${idx + 1}.html`, renderRhythm(pair, idx, "en")));
  write("16_en_rhythm_summary.html", renderRhythmSummary(EN_PAIRS, "en"));

  write(
    "16_en_break_work.html",
    renderDivider({ mode: "en", title: "Main Task Start!", subtitle: "Choose the opposite word." })
  );

  EN_QUESTIONS.forEach((q, idx) => write(`17_en_work_${idx + 1}.html`, renderWork(q, idx, "en")));

  write(
    "17_en_break_deep.html",
    renderDivider({ mode: "en", title: "Think Deeper!", subtitle: "Compare from different viewpoints." })
  );

  DEEP_ITEMS_EN.forEach((_, idx) => write(`18_en_deep_step_${idx + 1}.html`, renderDeepStep(idx, "en", DEEP_ITEMS_EN)));
  comparePairs.forEach((pair, idx) =>
    write(`19_en_deep_compare_${idx + 1}.html`, renderDeepCompare(idx, pair, "en", DEEP_ITEMS_EN))
  );

  write("20_end.html", renderEnd());

  console.log("regenerated week5 bigscreen files with break and end slides");
}

generate();
