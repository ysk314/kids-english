import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(scriptDir, "../screens/week9");

const SUBJECTS = [
  {
    key: "mutsumi-sensei",
    jp: "むつみ先生",
    en: "Mutsumi",
    img: "../../assets/week9/mutsumi-sensei.png",
    themeScale: 1.22,
    rhythmScale: 1.16,
    themeOffsetY: "0%",
    rhythmOffsetY: "0%",
    jpSentence: "むつみ先生は えいごの せんせいです。",
    enSentence: "Mutsumi is an English teacher."
  },
  {
    key: "bee",
    jp: "はち",
    en: "A bee",
    img: "../../assets/week9/bee.png",
    themeScale: 1.18,
    rhythmScale: 1.12,
    themeOffsetY: "0%",
    rhythmOffsetY: "0%",
    jpSentence: "はちは むしです。",
    enSentence: "A bee is an insect."
  },
  {
    key: "bus",
    jp: "バス",
    en: "A bus",
    img: "../../assets/week9/bus.png",
    themeScale: 1.62,
    rhythmScale: 1.5,
    themeOffsetY: "10%",
    rhythmOffsetY: "8%",
    jpSentence: "バスは のりものです。",
    enSentence: "A bus is a vehicle."
  },
  {
    key: "apple",
    jp: "りんご",
    en: "An apple",
    img: "../../assets/week9/apple.png",
    themeScale: 1.18,
    rhythmScale: 1.15,
    themeOffsetY: "0%",
    rhythmOffsetY: "0%",
    jpSentence: "りんごは あかい。",
    enSentence: "An apple is red."
  },
  {
    key: "elephant",
    jp: "ぞう",
    en: "An elephant",
    img: "../../assets/week9/elephant.png",
    themeScale: 1.56,
    rhythmScale: 1.42,
    themeOffsetY: "10%",
    rhythmOffsetY: "8%",
    jpSentence: "ぞうは おおきい。",
    enSentence: "An elephant is big."
  },
  {
    key: "rabbit",
    jp: "うさぎ",
    en: "A rabbit",
    img: "../../assets/week9/rabbit.png",
    themeScale: 1.52,
    rhythmScale: 1.4,
    themeOffsetY: "12%",
    rhythmOffsetY: "10%",
    jpSentence: "うさぎは かわいい。",
    enSentence: "A rabbit is cute."
  },
  {
    key: "monster",
    jp: "モンスター",
    en: "A monster",
    img: "../../assets/week9/monster.png",
    themeScale: 1.12,
    rhythmScale: 1.2,
    themeOffsetY: "0%",
    rhythmOffsetY: "0%",
    jpSentence: "モンスターは こわい。",
    enSentence: "A monster is scary."
  }
];

const THEME_SUBJECTS = SUBJECTS.filter((item) => item.key !== "mutsumi-sensei");
const RHYTHM_SEQUENCE = [1, 2, 3, 4, 5, 6, 0];

function fallbackImage(img, label, { className = "", scale = 1, offsetY = "0%" } = {}) {
  return `
    <div class="week9-img-shell${className ? ` ${className}` : ""}" style="--img-scale:${scale};--img-offset-y:${offsetY}">
      <img src="${img}" alt="${label}" onerror="this.hidden=true;this.parentElement.classList.add('missing')">
      <div class="week9-img-fallback">${label}</div>
    </div>
  `;
}

function renderSentenceMarkup(sentence) {
  const tokens = String(sentence)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `<span class="week9-sentence-token">${token}</span>`)
    .join("");
  return `<div class="sentence week9-sentence-line">${tokens}</div>`;
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
      .week9-sentence-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
        justify-items: center;
      }
      .week9-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        padding: 14px;
        border-radius: 26px;
        background: rgba(255, 255, 255, 0.88);
        border: 4px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 10px 22px rgba(71, 18, 45, 0.12);
        width: min(760px, 100%);
      }
      .week9-img-shell {
        position: relative;
        width: 100%;
        height: clamp(240px, 36vh, 360px);
        border-radius: 22px;
        overflow: hidden;
        background: linear-gradient(135deg, #fff9ef, #ffe8f3);
        border: 3px solid rgba(244, 227, 199, 0.9);
      }
      .week9-img-shell img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: translateY(var(--img-offset-y, 0%)) scale(var(--img-scale, 1));
        transform-origin: center center;
      }
      .week9-img-shell.missing img {
        display: none;
      }
      .week9-img-fallback {
        position: absolute;
        inset: 0;
        display: none;
        place-items: center;
        padding: 16px;
        text-align: center;
        font-family: "Yusei Magic", sans-serif;
        font-size: clamp(26px, 3vw, 40px);
        color: #4b3651;
        background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.95), rgba(255,235,246,0.92));
      }
      .week9-img-shell.missing .week9-img-fallback {
        display: grid;
      }
      .week9-card .sentence {
        font-size: clamp(25px, 3vw, 40px);
        font-weight: 800;
        line-height: 1.3;
        text-align: center;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-sentence-line {
        display: flex;
        flex-wrap: wrap;
        gap: 0.24em;
        align-items: center;
      }
      .week9-sentence-token {
        display: inline-block;
        white-space: nowrap;
      }
      .week9-theme-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        width: min(1120px, 100%);
        margin: 0 auto;
      }
      .week9-theme-item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.9);
        border: 3px solid rgba(255, 255, 255, 0.92);
      }
      .week9-theme-item .week9-img-shell {
        height: clamp(180px, 24vh, 250px);
      }
      .week9-theme-banner {
        padding: 18px 22px;
        border-radius: 26px;
        background: linear-gradient(135deg, #fff9ef, #ffe8f3);
        border: 4px solid rgba(255, 255, 255, 0.92);
        text-align: center;
      }
      .week9-theme-banner strong {
        display: block;
        font-size: clamp(28px, 3.4vw, 42px);
        font-family: "Yusei Magic", sans-serif;
      }
      .week9-theme-banner p {
        margin: 10px 0 0;
        font-size: clamp(20px, 2.6vw, 30px);
        font-weight: 800;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-work-board {
        display: grid;
        gap: 16px;
        width: min(1240px, 100%);
        margin: 0 auto;
      }
      .week9-rhythm-row {
        width: min(1180px, 100%);
        display: grid;
        grid-template-columns: minmax(320px, 0.92fr) minmax(420px, 1.08fr);
        gap: 22px;
        align-items: stretch;
        margin-inline: auto;
      }
      .week9-rhythm-visual,
      .week9-rhythm-copy {
        border-radius: 30px;
        background: rgba(255, 255, 255, 0.92);
        border: 4px solid rgba(255, 255, 255, 0.96);
        box-shadow: 0 10px 22px rgba(71, 18, 45, 0.12);
      }
      .week9-rhythm-visual {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .week9-rhythm-visual .week9-img-shell {
        width: 100%;
        height: clamp(340px, 54vh, 560px);
      }
      .week9-rhythm-copy {
        padding: 28px 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .week9-rhythm-copy .sentence {
        font-size: clamp(42px, 5.4vw, 74px);
        line-height: 1.22;
        justify-content: flex-start;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-work-slots {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .week9-slot {
        border-radius: 24px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.92);
        border: 4px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 20px rgba(71, 18, 45, 0.12);
      }
      .week9-slot-label {
        font-size: 20px;
        font-weight: 800;
        color: #80506c;
      }
      .week9-slot-value {
        margin-top: 10px;
        min-height: 82px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: linear-gradient(135deg, #fff9ef, #ffe8f3);
        border: 3px dashed #ef9cc4;
        font-size: clamp(28px, 3.2vw, 42px);
        font-weight: 800;
        text-align: center;
        padding: 12px;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-slot.is-live .week9-slot-value {
        animation: card-bob 620ms ease-in-out infinite;
        border-style: solid;
        border-color: #ff4f7d;
      }
      .week9-status {
        text-align: center;
        font-size: clamp(20px, 2.6vw, 30px);
        font-weight: 800;
        color: #5f3657;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-result-card {
        display: grid;
        grid-template-columns: minmax(320px, 0.92fr) minmax(420px, 1.08fr);
        gap: 22px;
        align-items: stretch;
        margin-inline: auto;
      }
      .week9-result-card.is-hidden {
        display: none;
      }
      .week9-result-image,
      .week9-result-copy {
        border-radius: 30px;
        background: rgba(255, 255, 255, 0.92);
        border: 4px solid rgba(255, 255, 255, 0.96);
        box-shadow: 0 10px 22px rgba(71, 18, 45, 0.12);
      }
      .week9-result-image {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .week9-result-copy {
        padding: 28px 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .week9-result-copy .label {
        font-size: 20px;
        font-weight: 800;
        color: #80506c;
      }
      .week9-result-copy .sentence {
        font-size: clamp(42px, 5.4vw, 74px);
        line-height: 1.22;
        justify-content: flex-start;
        word-break: keep-all;
        overflow-wrap: normal;
      }
      .week9-result-image .week9-img-shell {
        width: 100%;
        height: clamp(340px, 54vh, 560px);
      }
      @media (max-width: 980px) {
        .week9-theme-grid,
        .week9-work-slots,
        .week9-sentence-grid {
          grid-template-columns: 1fr;
        }
        .week9-rhythm-row {
          grid-template-columns: 1fr;
        }
        .week9-result-card {
          grid-template-columns: 1fr;
        }
        .week9-rhythm-copy .sentence,
        .week9-result-copy .sentence {
          justify-content: center;
        }
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

function progressDots(count, active) {
  return `<div class="flow-progress">${Array.from(
    { length: count },
    (_, i) => `<span class="${i <= active ? "on" : ""}"></span>`
  ).join("")}</div>`;
}

function sentenceCard(item, lang, extraClass = "") {
  const sentence = lang === "jp" ? item.jpSentence : item.enSentence;
  const label = lang === "jp" ? item.jp : item.en;
  return `
    <article class="week9-card${extraClass ? ` ${extraClass}` : ""} deep-item">
      ${fallbackImage(item.img, label, { scale: item.themeScale ?? 1 })}
      <div class="sentence">${sentence}</div>
    </article>
  `;
}

function themeCard(item) {
  return `
    <article class="week9-theme-item">
      ${fallbackImage(item.img, item.jp, {
        scale: item.themeScale ?? 1,
        offsetY: item.themeOffsetY ?? "0%"
      })}
    </article>
  `;
}

function renderThemeTitle() {
  const body = `
    <div class="week9-work-board">
      <div class="week9-theme-banner">
        <strong>きょうの テーマ</strong>
        <p>どんなだ？ なんだ？ ことばで せつめいしよう！</p>
      </div>
      <div class="week9-theme-grid">
        ${THEME_SUBJECTS.map((item) => themeCard(item)).join("")}
      </div>
    </div>
  `;

  return pageShell({
    title: "11_theme_title",
    heading: "だい9しゅう どんなだ？ なんだ？",
    body,
    bodyClass: "body-theme"
  });
}

function renderRhythm(index, lang) {
  const item = SUBJECTS[RHYTHM_SEQUENCE[index] ?? index];
  const sentence = lang === "jp" ? item.jpSentence : item.enSentence;
  const label = lang === "jp" ? item.jp : item.en;
  const body = `
    ${progressDots(7, index)}
    <div class="week9-rhythm-row">
      <section class="week9-rhythm-visual">
        ${fallbackImage(item.img, label, {
          scale: item.rhythmScale ?? item.themeScale ?? 1,
          offsetY: item.rhythmOffsetY ?? "0%"
        })}
      </section>
      <section class="week9-rhythm-copy">
        ${renderSentenceMarkup(sentence)}
      </section>
    </div>
  `;

  return pageShell({
    title: `${lang}_rhythm_${index + 1}`,
    heading: lang === "jp" ? "リズムで ぶんを いおう！" : "Say the sentence in rhythm!",
    body,
    mode: lang,
    bodyClass: "body-rhythm"
  });
}

function renderDivider(id, heading, title, subtitle, mode = "jp") {
  return pageShell({
    title: id,
    heading,
    mode,
    body: `
      <div class="divider-card">
        <p>${title}</p>
        <strong>${subtitle}</strong>
      </div>
    `,
    bodyClass: "body-divider"
  });
}

function renderWork(lang) {
  const subjectLabel = lang === "jp" ? "しゅご" : "subject";
  const predicateLabel = lang === "jp" ? "じゅつご" : "predicate";
  const placeholder = lang === "jp" ? "？" : "?";

  const body = `
    <div class="week9-work-board">
      <div class="week9-status" data-role="work-status">${lang === "jp" ? "しゅごを えらぼう！" : "Choose the subject."}</div>
      <div class="week9-work-slots">
        <section class="week9-slot" data-role="subject-slot-shell">
          <div class="week9-slot-label">${subjectLabel}</div>
          <div class="week9-slot-value" data-role="work-subject-slot">${placeholder}</div>
        </section>
        <section class="week9-slot" data-role="predicate-slot-shell">
          <div class="week9-slot-label">${predicateLabel}</div>
          <div class="week9-slot-value" data-role="work-predicate-slot">${placeholder}</div>
        </section>
      </div>
      <section class="week9-result-card is-hidden" data-role="work-result-card">
        <div class="week9-result-image">
          <div class="week9-img-shell" data-role="work-image-shell">
            <img data-role="work-image" alt="" onerror="this.hidden=true;this.parentElement.classList.add('missing')">
            <div class="week9-img-fallback" data-role="work-image-fallback"></div>
          </div>
        </div>
        <div class="week9-result-copy">
          <div class="sentence week9-sentence-line" data-role="work-sentence"></div>
        </div>
      </section>
    </div>
  `;

  return pageShell({
    title: `${lang}_work_1`,
    heading: lang === "jp" ? "ルーレットで ぶんを つくろう！" : "Make a sentence with roulette!",
    body,
    mode: lang,
    bodyClass: "body-work"
  });
}

function renderEnd() {
  return pageShell({
    title: "20_end",
    heading: "Great Job!",
    mode: "en",
    body: `
      <div class="divider-card end-card">
        <p>End</p>
        <strong>Let us read more sentences next time!</strong>
      </div>
    `,
    bodyClass: "body-end"
  });
}

const files = {
  "11_theme_title.html": renderThemeTitle(),
  "12_jp_rhythm_1.html": renderRhythm(0, "jp"),
  "12_jp_rhythm_2.html": renderRhythm(1, "jp"),
  "12_jp_rhythm_3.html": renderRhythm(2, "jp"),
  "12_jp_rhythm_4.html": renderRhythm(3, "jp"),
  "12_jp_rhythm_5.html": renderRhythm(4, "jp"),
  "12_jp_rhythm_6.html": renderRhythm(5, "jp"),
  "12_jp_rhythm_7.html": renderRhythm(6, "jp"),
  "12_jp_rhythm_to_work.html": renderDivider(
    "12_jp_rhythm_to_work",
    "つぎへ すすもう",
    "ルーレットで ぶんを つくろう",
    "しゅご と じゅつご を とめて ぶんを つくろう"
  ),
  "13_jp_work_1.html": renderWork("jp"),
  "15_jp_to_en_start.html": renderDivider(
    "15_jp_to_en_start",
    "Get Ready",
    "English Part Start!",
    "こんどは 英語で おなじ かたちを いってみよう",
    "en"
  ),
  "16_en_rhythm_1.html": renderRhythm(0, "en"),
  "16_en_rhythm_2.html": renderRhythm(1, "en"),
  "16_en_rhythm_3.html": renderRhythm(2, "en"),
  "16_en_rhythm_4.html": renderRhythm(3, "en"),
  "16_en_rhythm_5.html": renderRhythm(4, "en"),
  "16_en_rhythm_6.html": renderRhythm(5, "en"),
  "16_en_rhythm_7.html": renderRhythm(6, "en"),
  "16_en_rhythm_to_work.html": renderDivider(
    "16_en_rhythm_to_work",
    "Get Ready",
    "Make a sentence with roulette",
    "Stop the subject and predicate to make a sentence.",
    "en"
  ),
  "17_en_work_1.html": renderWork("en"),
  "20_end.html": renderEnd()
};

fs.mkdirSync(screensDir, { recursive: true });
Object.entries(files).forEach(([name, html]) => {
  fs.writeFileSync(path.join(screensDir, name), html);
});
