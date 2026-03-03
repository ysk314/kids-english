import fs from "node:fs";
import path from "node:path";

const screensDir = "/Users/yasuki/Documents/GitHub/幼児英語/mockup/screens/week1";

const CARDS = {
  dog: { jp: "いぬ", en: "dog", img: "../../assets/week1_cards_clean/animal/dog.png" },
  cat: { jp: "ねこ", en: "cat", img: "../../assets/week1_cards_clean/animal/cat.png" },
  rabbit: { jp: "うさぎ", en: "rabbit", img: "../../assets/week1_cards_clean/animal/rabbit.png" },
  bird: { jp: "とり", en: "bird", img: "../../assets/week1_cards_clean/animal/bird.png" },
  elephant: { jp: "ぞう", en: "elephant", img: "../../assets/week1_cards_clean/animal/elephant.png" },
  frog: { jp: "かえる", en: "frog", img: "../../assets/week1_cards_clean/animal/frog.png" },
  octopus: { jp: "たこ", en: "octopus", img: "../../assets/week1_cards_clean/animal/octopus.png" },

  orange: { jp: "みかん", en: "orange", img: "../../assets/week1_cards_clean/fruit/orange.png" },
  grape: { jp: "ぶどう", en: "grape", img: "../../assets/week1_cards_clean/fruit/grape.png" },
  watermelon: { jp: "すいか", en: "watermelon", img: "../../assets/week1_cards_clean/fruit/watermelon.png" },
  pineapple: { jp: "パイナップル", en: "pineapple", img: "../../assets/week1_cards_clean/fruit/pineapple.png" },
  strawberry: { jp: "いちご", en: "strawberry", img: "../../assets/week1_cards_clean/fruit/strawberry.png" },

  bus: { jp: "バス", en: "bus", img: "../../assets/week1_cards_clean/motor/bus.png" },
  taxi: { jp: "タクシー", en: "taxi", img: "../../assets/week1_cards_clean/motor/taxi.png" },
  bicycle: { jp: "じてんしゃ", en: "bicycle", img: "../../assets/week1_cards_clean/motor/bicycle.png" },
  bike: { jp: "バイク", en: "bike", img: "../../assets/week1_cards_clean/motor/bike.png" },
  firetruck: { jp: "しょうぼうしゃ", en: "firetruck", img: "../../assets/week1_cards_clean/motor/firetruck.png" }
};

const RHYTHM_ROUNDS = [
  { jpId: "12_jp_rhythm_1", enId: "16_en_rhythm_1", keys: ["dog", "cat", "rabbit", "orange"] },
  { jpId: "12_jp_rhythm_2", enId: "16_en_rhythm_2", keys: ["orange", "grape", "watermelon", "bus"] },
  { jpId: "12_jp_rhythm_3", enId: "16_en_rhythm_3", keys: ["bus", "taxi", "bicycle", "elephant"] }
];
const THEME_TITLE_KEYS = ["orange", "grape", "watermelon", "bus"];

const WORK_ROUNDS = [
  { jpId: "13_jp_work_1", enId: "17_en_work_1", keys: ["cat", "orange", "dog", "rabbit"] },
  { jpId: "13_jp_work_2", enId: "17_en_work_2", keys: ["taxi", "orange", "grape", "pineapple"] },
  { jpId: "13_jp_work_3", enId: "17_en_work_3", keys: ["bus", "taxi", "bike", "bird"] },
  { jpId: "13_jp_work_4", enId: "17_en_work_4", keys: ["elephant", "cat", "bicycle", "dog"] },
  { jpId: "13_jp_work_5", enId: "17_en_work_5", keys: ["grape", "rabbit", "watermelon", "orange"] },
  { jpId: "13_jp_work_6", enId: "17_en_work_6", keys: ["pineapple", "bus", "taxi", "bicycle"] }
];

const DEEP_STEPS = [
  {
    jpId: "14_jp_deep_step_1",
    enId: "18_en_deep_step_1",
    keys: ["bus", "taxi", "pineapple", "grape"],
    jpHeading: "こんどはどれがなかまはずれ？",
    enHeading: "Which one is odd now?"
  },
  {
    jpId: "14_jp_deep_step_2",
    enId: "18_en_deep_step_2",
    keys: ["rabbit", "strawberry", "firetruck", "octopus"],
    jpHeading: "こんどはどれがなかまはずれ？",
    enHeading: "Which one is odd now?"
  },
  {
    jpId: "14_jp_deep_step_3",
    enId: "18_en_deep_step_3",
    keys: ["bird", "pineapple", "frog", "bike"],
    jpHeading: "こんどはどれがなかまはずれ？",
    enHeading: "Which one is odd now?"
  },
  {
    jpId: "14_jp_deep_step_4",
    enId: "18_en_deep_step_4",
    keys: ["pineapple", "strawberry", "firetruck", "watermelon"],
    jpHeading: "これはこたえは１つじゃないかも",
    enHeading: "There may be more than one answer"
  }
];

function progressDots(count, active) {
  return `<div class="flow-progress">${Array.from(
    { length: count },
    (_, i) => `<span class="${i <= active ? "on" : ""}"></span>`
  ).join("")}</div>`;
}

function pageShell({ title, heading, body, mode = "jp", bodyClass = "" }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="../../shared.css">
    <style>
      .week1-grid-2x2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .week1-grid-2x2 .deep-item {
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        --img-scale: 1.18;
      }
      .week1-grid-2x2 .deep-item .img-viewport {
        width: 100%;
        height: clamp(180px, 27vh, 300px);
        overflow: hidden;
        border-radius: 12px;
      }
      .week1-grid-2x2 .deep-item img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: scale(var(--img-scale));
        transform-origin: center center;
      }
      .week1-grid-2x2 .deep-item .label {
        font-size: clamp(21px, 2.8vw, 34px);
      }
      .body-rhythm .week1-grid-2x2 .deep-item {
        --img-scale: 1.2;
      }
      .body-work .week1-grid-2x2 .deep-item {
        --img-scale: 1.16;
      }
    </style>
  </head>
  <body>
    <main class="bigscreen ${mode}">
      <h1>${heading}</h1>
      <section class="slide-body ${bodyClass}">${body}</section>
    </main>
  </body>
</html>`;
}

function cardTile(card, { className = "deep-item", lang = "jp", showLabel = true } = {}) {
  const label = lang === "en" ? card.en : card.jp;
  return `
    <div class="${className}">
      <div class="img-viewport">
        <img src="${card.img}" alt="${label}">
      </div>
      ${showLabel ? `<div class="label">${label}</div>` : ""}
    </div>`;
}

function renderThemeTitle() {
  const cards = THEME_TITLE_KEYS.map((key) => CARDS[key]);
  const body = `
    <div class="theme-title-card">
      <strong>きょうの テーマ</strong>
      <p>なかまはずれを たのしく みつけよう！</p>
    </div>
    <div class="deep-board compact">
      <div class="week1-grid-2x2 week1-theme-grid">
        ${cards.map((card) => cardTile(card, { lang: "jp", showLabel: false })).join("")}
      </div>
    </div>
  `;

  return pageShell({
    title: "11_theme_title",
    heading: "だい1しゅう なかまはずれ",
    body,
    bodyClass: "body-theme"
  });
}

function renderRhythmRound(round, idx, lang) {
  const cards = round.keys.map((key) => CARDS[key]);
  const body = `
    ${progressDots(3, idx)}
    <div class="deep-board compact">
      <div class="week1-grid-2x2">
        ${cards.map((card) => cardTile(card, { lang })).join("")}
      </div>
    </div>
  `;

  return pageShell({
    title: lang === "jp" ? round.jpId : round.enId,
    heading: lang === "jp" ? "リズムで なかまはずれ！" : "Rhythm: Find the odd one!",
    body,
    mode: lang,
    bodyClass: "body-rhythm"
  });
}

function renderDivider(title, subtitle, { mode = "jp", heading = "つぎへ すすもう" } = {}) {
  const body = `
    <div class="divider-card">
      <p>${title}</p>
      <strong>${subtitle}</strong>
    </div>
  `;

  return pageShell({
    title,
    heading,
    body,
    mode,
    bodyClass: "body-divider"
  });
}

function renderWork(round, idx, lang) {
  const cards = round.keys.map((key) => CARDS[key]);
  const body = `
    ${progressDots(6, idx)}
    <div class="deep-board compact">
      <div class="week1-grid-2x2">
        ${cards.map((card) => cardTile(card, { className: "deep-item option-card", lang })).join("")}
      </div>
    </div>
  `;

  return pageShell({
    title: lang === "jp" ? round.jpId : round.enId,
    heading: lang === "jp" ? `リズムよく、タップしよう！（${idx + 1}/６）` : `Tap with rhythm! (${idx + 1}/6)`,
    body,
    mode: lang,
    bodyClass: "body-work"
  });
}

function renderDeepStep(step, idx, lang) {
  const cards = step.keys.map((key) => CARDS[key]);
  const body = `
    ${progressDots(4, idx)}
    <div class="deep-board compact">
      <div class="week1-grid-2x2">
        ${cards.map((card) => cardTile(card, { lang })).join("")}
      </div>
    </div>
  `;

  return pageShell({
    title: lang === "jp" ? step.jpId : step.enId,
    heading: lang === "jp" ? step.jpHeading : step.enHeading,
    body,
    mode: lang,
    bodyClass: "body-deep-step"
  });
}

function renderDeepMake(lang) {
  const body =
    lang === "jp"
      ? `
    <div class="divider-card">
      <p>じぶんでもクイズをつくろう！</p>
      <strong>なかま３つ、なかまはずれ１つでクイズを作ろう</strong>
    </div>
  `
      : `
    <div class="divider-card">
      <p>Make your own quiz!</p>
      <strong>Choose 3 + 1 odd card</strong>
    </div>
  `;

  return pageShell({
    title: lang === "jp" ? "15_jp_deep_make_1" : "19_en_deep_make_1",
    heading: lang === "jp" ? "じぶんでもクイズをつくろう！" : "Make a question!",
    body,
    mode: lang
  });
}

function renderEnd() {
  const body = `
    <div class="divider-card end-card">
      <p>おしまい</p>
      <strong>Great Job!</strong>
      <span>つぎも がんばろう！</span>
    </div>
  `;

  return pageShell({
    title: "20_end",
    heading: "きょうの まとめ",
    body,
    mode: "mix"
  });
}

function write(name, html) {
  fs.writeFileSync(path.join(screensDir, `${name}.html`), html, "utf8");
}

function cleanOldScreens() {
  if (!fs.existsSync(screensDir)) {
    return;
  }
  fs.readdirSync(screensDir).forEach((file) => {
    if (file.endsWith(".html")) {
      fs.unlinkSync(path.join(screensDir, file));
    }
  });
}

function generate() {
  fs.mkdirSync(screensDir, { recursive: true });
  cleanOldScreens();

  write("11_theme_title", renderThemeTitle());

  RHYTHM_ROUNDS.forEach((round, idx) => {
    write(round.jpId, renderRhythmRound(round, idx, "jp"));
  });
  write(
    "12_jp_rhythm_to_work",
    renderDivider("リズムよく、タップしよう！", "なかまじゃないカードをタイミングよくタップしよう！")
  );

  WORK_ROUNDS.forEach((round, idx) => {
    write(round.jpId, renderWork(round, idx, "jp"));
  });
  write(
    "13_jp_work_to_deep",
    renderDivider("みかたを かえてみよう！", "いままでとはちがうことに　ちゅうもくしよう", {
      heading: "ふかくかんがえよう"
    })
  );

  DEEP_STEPS.forEach((step, idx) => {
    write(step.jpId, renderDeepStep(step, idx, "jp"));
  });
  write("15_jp_deep_make_1", renderDeepMake("jp"));

  write(
    "15_jp_to_en_start",
    renderDivider("えいごモードへ チェンジ！", "Get Ready<br>日本語パートは これで おしまい！<br>English Part Start!", {
      mode: "mix",
      heading: "English Time"
    })
  );

  RHYTHM_ROUNDS.forEach((round, idx) => {
    write(round.enId, renderRhythmRound(round, idx, "en"));
  });
  write(
    "16_en_rhythm_to_work",
    renderDivider("Tap with rhythm!", "Tap the odd one in time!", {
      mode: "en",
      heading: "Next"
    })
  );

  WORK_ROUNDS.forEach((round, idx) => {
    write(round.enId, renderWork(round, idx, "en"));
  });
  write(
    "17_en_work_to_deep",
    renderDivider("Let's change our viewpoint!", "Look from a different angle", {
      mode: "en",
      heading: "Next"
    })
  );

  DEEP_STEPS.forEach((step, idx) => {
    write(step.enId, renderDeepStep(step, idx, "en"));
  });
  write("19_en_deep_make_1", renderDeepMake("en"));

  write("20_end", renderEnd());

  console.log("generated week1 jp+en screens");
}

generate();
