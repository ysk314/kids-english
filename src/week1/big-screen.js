import { WEEK1_SLIDES } from "./lessonData.js";
import { SessionBus, defaultSessionId } from "../week5/sessionBus.js";
import { resolveAppUrl } from "../week5/utils.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session") || defaultSessionId("week1");
const embedParam = params.get("embed") === "1";
const isEmbed = embedParam && window.self !== window.top;

const bus = new SessionBus(sessionId, {
  role: "bigscreen",
  remoteEnabled: !isEmbed
});
const frame = document.querySelector("[data-testid='bigscreen-frame']");
const slideCount = document.querySelector("[data-testid='bigscreen-count']");
const mirrorStatus = document.querySelector("[data-testid='bigscreen-status']");
const pointHeader = document.querySelector("[data-testid='bigscreen-points']");
const pointFx = document.querySelector("[data-testid='bigscreen-point-fx']");
const pointFxLabel = document.querySelector("[data-testid='bigscreen-point-fx-label']");
const endFx = document.querySelector("[data-testid='bigscreen-end-fx']");
const endFxLabel = document.querySelector("[data-testid='bigscreen-end-fx-label']");
const fullscreenButton = document.querySelector("[data-testid='fullscreen-btn']");

let state = {
  slideIndex: 0,
  studentPoints: 0,
  teacherPoints: 0,
  updatedAt: 0
};
let pointFxTimer = null;
let fxAudio = null;
let endRollAudio = null;
let endCymbalAudio = null;
let endAudioTimer = null;
let endIntroTimer = null;
let hydratedFx = false;
let lastFxId = "";
let lastSlideId = "";
let lastBeatSignalId = "";
let latestBeatStep16 = 0;
let lastRhythmKickMarker = "";
const rhythmKickCountBySlide = new Map();
let lastEndRevealAt = null;
const POINT_FX_DURATION_MS = 1900;

const END_ROLL_START_DELAY_MS = 3000;
const END_CYMBAL_DELAY_MS = 1300;
const CLOCKWISE_ORDER_2X2 = [0, 1, 3, 2];
// deep-item index:
// 0 short pencil, 1 long pencil, 2 snake, 3 train
const DEEP_COMPARE_STEPS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 3]
];

function render() {
  const index = Math.min(WEEK1_SLIDES.length - 1, Math.max(0, state.slideIndex || 0));
  const slide = WEEK1_SLIDES[index];
  if (!slide) {
    return;
  }

  const nextSrc = slide.screenPath;
  if (frame.getAttribute("src") !== nextSrc) {
    frame.setAttribute("src", nextSrc);
  }

  slideCount.textContent = `${index + 1} / ${WEEK1_SLIDES.length}`;
  mirrorStatus.textContent = "Mirror Connected";
  mirrorStatus.classList.add("hot");
  pointHeader.textContent = `みんな ${state.studentPoints ?? 0} / むつみ先生 ${state.teacherPoints ?? 0}`;

  lastSlideId = slide.id;

  applySlideInteraction();
}

async function toggleFullscreen() {
  const root = document.documentElement;
  const body = document.body;
  const doc = document;
  const current =
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement;

  if (current) {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return;
    }
    if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
      return;
    }
    if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
    return;
  }

  if (root.requestFullscreen) {
    await root.requestFullscreen();
    return;
  }
  if (root.webkitRequestFullscreen) {
    root.webkitRequestFullscreen();
    return;
  }
  if (body && body.webkitRequestFullscreen) {
    body.webkitRequestFullscreen();
    return;
  }
  if (root.msRequestFullscreen) {
    root.msRequestFullscreen();
    return;
  }

  throw new Error("fullscreen not supported");
}

function updateFullscreenButtonLabel() {
  if (!fullscreenButton) {
    return;
  }
  const current =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;
  fullscreenButton.textContent = current ? "全画面解除" : "全画面";
}

function ensureFxAudio() {
  if (fxAudio) {
    return fxAudio;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  fxAudio = new AudioContextClass();
  if (fxAudio.state === "suspended") {
    fxAudio.resume().catch(() => {});
  }
  return fxAudio;
}

function playPointFxSound(type) {
  const context = ensureFxAudio();
  if (!context) {
    return;
  }
  const now = context.currentTime;
  const notes = type === "teacher" ? [587, 784, 1047] : [880, 1175, 1568];

  notes.forEach((freq, i) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.setValueAtTime(0.0001, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.06 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.16);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.18);
  });
}

function playEndFanfare() {
  if (!endRollAudio || !endCymbalAudio) {
    endRollAudio = new Audio(resolveAppUrl("mockup/assets/audio/end_drum_roll.mp3"));
    endRollAudio.preload = "auto";
    endCymbalAudio = new Audio(resolveAppUrl("mockup/assets/audio/end_cymbal.mp3"));
    endCymbalAudio.preload = "auto";
  }

  if (endAudioTimer) {
    window.clearTimeout(endAudioTimer);
    endAudioTimer = null;
  }

  if (!isEmbed) {
    try {
      endRollAudio.currentTime = 0;
      const rollPromise = endRollAudio.play();
      if (rollPromise && typeof rollPromise.catch === "function") {
        rollPromise.catch(() => {});
      }
    } catch {
      // no-op
    }
  }

  endAudioTimer = window.setTimeout(() => {
    if (!isEmbed && endRollAudio) {
      endRollAudio.pause();
    }
    if (!isEmbed && endCymbalAudio) {
      try {
        endCymbalAudio.currentTime = 0;
        const cymbalPromise = endCymbalAudio.play();
        if (cymbalPromise && typeof cymbalPromise.catch === "function") {
          cymbalPromise.catch(() => {});
        }
      } catch {
        // no-op
      }
    }
    revealEndFx();
    endAudioTimer = null;
  }, END_CYMBAL_DELAY_MS);
}

function buildScoreLine(label, score, isWinner) {
  const cssClass = isWinner ? "winner" : "plain";
  return `<span class="${cssClass}">${label}　${score}てん</span>`;
}

function revealEndFx() {
  if (!endFx || !endFxLabel) {
    return;
  }
  const student = Number(state.studentPoints ?? 0);
  const teacher = Number(state.teacherPoints ?? 0);
  const studentWin = student > teacher;
  const teacherWin = teacher > student;

  endFxLabel.innerHTML = [
    "けっか　はっぴょう！",
    "",
    buildScoreLine("みんな", student, studentWin),
    buildScoreLine("むつみせんせい", teacher, teacherWin)
  ].join("<br>");

  endFx.classList.remove("burst");
  void endFx.offsetWidth;
  endFx.classList.add("show", "burst");
}

function triggerPointFx(type, label) {
  if (!pointFx || !pointFxLabel) {
    return;
  }

  if (pointFxTimer) {
    window.clearTimeout(pointFxTimer);
    pointFxTimer = null;
  }

  pointFx.classList.remove("student", "teacher", "correct", "incorrect", "active");
  pointFx.classList.add(type);
  pointFx.classList.toggle("symbol", type === "correct" || type === "incorrect");
  pointFxLabel.textContent = label;
  void pointFx.offsetWidth;
  pointFx.classList.add("active");
  if (!isEmbed && (type === "student" || type === "teacher")) {
    playPointFxSound(type);
  }

  pointFxTimer = window.setTimeout(() => {
    pointFx.classList.remove("active", "student", "teacher", "correct", "incorrect", "symbol");
    pointFxTimer = null;
  }, POINT_FX_DURATION_MS);
}

function triggerEndFx() {
  if (!endFx || !endFxLabel) {
    return;
  }
  if (endIntroTimer) {
    window.clearTimeout(endIntroTimer);
    endIntroTimer = null;
  }
  endFx.classList.remove("show", "burst");

  endIntroTimer = window.setTimeout(() => {
    playEndFanfare();
    endIntroTimer = null;
  }, END_ROLL_START_DELAY_MS);
}

function clearEndFx() {
  if (!endFx) {
    return;
  }
  endFx.classList.remove("show", "burst");
  if (endAudioTimer) {
    window.clearTimeout(endAudioTimer);
    endAudioTimer = null;
  }
  if (endIntroTimer) {
    window.clearTimeout(endIntroTimer);
    endIntroTimer = null;
  }
  if (endRollAudio) {
    endRollAudio.pause();
  }
}

function triggerFxEventIfNeeded(incoming) {
  const fxEvent = incoming?.fxEvent;
  if (!fxEvent || typeof fxEvent !== "object" || !fxEvent.id) {
    return;
  }

  if (!hydratedFx) {
    lastFxId = fxEvent.id;
    hydratedFx = true;
    return;
  }

  if (fxEvent.id === lastFxId) {
    return;
  }

  lastFxId = fxEvent.id;

  if (fxEvent.kind === "student") {
    triggerPointFx("student", "みんな＋１点");
    return;
  }
  if (fxEvent.kind === "teacher") {
    triggerPointFx("teacher", "むつみせんせい +1点");
    return;
  }
  if (fxEvent.kind === "correct") {
    triggerPointFx("correct", "◯");
    return;
  }
  if (fxEvent.kind === "incorrect") {
    triggerPointFx("incorrect", "×");
  }
}

function applyState(incoming) {
  if (!incoming || typeof incoming !== "object") {
    return;
  }
  if ((incoming.updatedAt || 0) < (state.updatedAt || 0)) {
    return;
  }

  state = {
    ...state,
    ...incoming
  };

  triggerFxEventIfNeeded(state);
  render();
}

function getFrameDoc() {
  if (!frame) {
    return null;
  }
  return frame.contentDocument || null;
}

function ensureFrameLiveStyle(doc) {
  if (!doc || doc.getElementById("week5-live-effects-style")) {
    return;
  }
  const injectionTarget = doc.head || doc.body || doc.documentElement;
  if (!injectionTarget) {
    return;
  }
  const style = doc.createElement("style");
  style.id = "week5-live-effects-style";
  style.textContent = `
    .option-card.live-selected {
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.22);
      border-color: #ff4f7d !important;
    }
    .option-card.live-correct {
      box-shadow: 0 0 0 4px rgba(62, 202, 130, 0.22);
      border-color: #29b563 !important;
    }
    .option-card.live-wrong {
      box-shadow: 0 0 0 4px rgba(235, 78, 98, 0.22);
      border-color: #e24862 !important;
    }
    .option-card.live-pulse {
      animation: live-pop 420ms ease-out;
    }
    .option-card.live-kick {
      border-color: #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.24), 0 10px 20px rgba(19, 24, 47, 0.18);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    }
    .target-large.live-target-correct,
    .focus-card.live-target-correct {
      box-shadow: 0 0 0 5px rgba(62, 202, 130, 0.25);
    }
    .target-large.live-target-wrong,
    .focus-card.live-target-wrong {
      box-shadow: 0 0 0 5px rgba(235, 78, 98, 0.22);
    }
    .deep-item.live-highlight {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 6px rgba(45, 125, 255, 0.26);
    }
    .deep-item.live-selected {
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.22);
      border-color: #ff4f7d !important;
    }
    .deep-item.live-correct {
      box-shadow: 0 0 0 4px rgba(62, 202, 130, 0.22);
      border-color: #29b563 !important;
    }
    .deep-item.live-wrong {
      box-shadow: 0 0 0 4px rgba(235, 78, 98, 0.22);
      border-color: #e24862 !important;
    }
    .deep-item.live-pulse {
      animation: live-pop 420ms ease-out;
    }
    .deep-item.live-kick {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.34), 0 9px 18px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.03);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
      animation: live-deep-kick 180ms ease-out;
    }
    .deep-item.live-kick-bump {
      animation: live-kick-bump-deep 180ms ease-out;
    }
    .flow-progress span.live-beat {
      background: #fff38e !important;
      box-shadow: 0 0 14px rgba(255, 241, 140, 0.78);
    }
    .focus-card.live-kick {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.3), 0 12px 24px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    }
    .focus-card.live-kick-bump {
      animation: live-kick-bump-focus 180ms ease-out;
    }
    @keyframes live-pop {
      0% { transform: scale(0.94); }
      55% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes live-deep-kick {
      0% { transform: scale(0.97); }
      55% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    @keyframes live-kick-bump-deep {
      0% { transform: translateY(-2px) scale(1.03); }
      45% { transform: translateY(-2px) scale(1.09); }
      100% { transform: translateY(-2px) scale(1.03); }
    }
    @keyframes live-kick-bump-focus {
      0% { transform: translateY(-2px) scale(1.015); }
      45% { transform: translateY(-2px) scale(1.07); }
      100% { transform: translateY(-2px) scale(1.015); }
    }
  `;
  injectionTarget.appendChild(style);
}

function inferDefaultSubStep(slide) {
  if (!slide || slide.kind !== "deep_compare") {
    return 0;
  }
  const match = /deep_compare_(\d+)$/.exec(slide.id || "");
  if (!match) {
    return 0;
  }
  return Math.min(3, Math.max(0, Number(match[1]) - 1));
}

function applyBeatPulse(step16) {
  const doc = getFrameDoc();
  if (!doc) {
    return;
  }
  const bars = Array.from(doc.querySelectorAll(".flow-progress span"));
  if (!bars.length) {
    return;
  }
  const active = step16 % bars.length;
  bars.forEach((bar, idx) => {
    bar.classList.toggle("live-beat", idx === active);
  });
}

function clearBeatPulse(doc) {
  if (!doc) {
    return;
  }
  doc.querySelectorAll(".flow-progress span.live-beat").forEach((bar) => {
    bar.classList.remove("live-beat");
  });
  doc.querySelectorAll(".focus-card.live-kick").forEach((card) => {
    card.classList.remove("live-kick");
  });
}

function applyRhythmKickEmphasis(doc, slide, step16) {
  if (!doc || !slide || slide.kind !== "rhythm") {
    return;
  }

  const beatIndex = ((Number(step16) || 0) % 16 + 16) % 16;
  const isKick = beatIndex === 0 || beatIndex === 8;
  if (isKick) {
    const marker = `${slide.id}:${beatIndex}:${lastBeatSignalId}`;
    if (marker !== lastRhythmKickMarker) {
      const prevKickCount = rhythmKickCountBySlide.get(slide.id) ?? 0;
      rhythmKickCountBySlide.set(slide.id, prevKickCount + 1);
      lastRhythmKickMarker = marker;
    }
  }

  const deepCards = Array.from(doc.querySelectorAll(".deep-item"));
  if (deepCards.length > 0) {
    const rotationOrder = deepCards.length === 4 ? CLOCKWISE_ORDER_2X2 : deepCards.map((_, idx) => idx);
    const kickCount = rhythmKickCountBySlide.get(slide.id) ?? 0;
    const activePosition = Math.floor(Math.max(0, kickCount - 1) / 2) % rotationOrder.length;
    const activeIndex = rotationOrder[activePosition] ?? 0;
    deepCards.forEach((card, idx) => {
      card.classList.remove("live-kick-bump");
      card.classList.toggle("live-kick", idx === activeIndex);
    });
    if (isKick) {
      const activeCard = deepCards[activeIndex];
      if (activeCard) {
        activeCard.classList.remove("live-kick-bump");
        void activeCard.offsetWidth;
        activeCard.classList.add("live-kick-bump");
      }
    }
    doc.querySelectorAll(".focus-card.live-kick").forEach((card) => {
      card.classList.remove("live-kick");
    });
    doc.querySelectorAll(".focus-card.live-kick-bump").forEach((card) => {
      card.classList.remove("live-kick-bump");
    });
    return;
  }

  const focusCards = Array.from(doc.querySelectorAll(".focus-card"));
  if (focusCards.length < 2) {
    return;
  }
  const kickCount = rhythmKickCountBySlide.get(slide.id) ?? 0;
  const activeIndex = Math.floor(Math.max(0, kickCount - 1) / 2) % focusCards.length;
  focusCards.forEach((card, idx) => {
    card.classList.remove("live-kick-bump");
    card.classList.toggle("live-kick", idx === activeIndex);
  });
  if (isKick) {
    const activeCard = focusCards[activeIndex];
    if (activeCard) {
      activeCard.classList.remove("live-kick-bump");
      void activeCard.offsetWidth;
      activeCard.classList.add("live-kick-bump");
    }
  }
}

function applyWorkInteraction(doc, slide) {
  if (!doc || slide.kind !== "work") {
    return;
  }
  const interaction = state.slideInteractions?.[slide.id] || {};
  const selectedChoice = Number.isFinite(interaction.selectedChoice) ? Number(interaction.selectedChoice) : null;
  const judgedResult = interaction.judgedResult === "correct" ? "correct" : interaction.judgedResult === "incorrect" ? "incorrect" : null;
  const cards = Array.from(doc.querySelectorAll(".option-card"));
  const target = doc.querySelector(".target-large, .focus-card");
  if (target) {
    target.classList.remove("live-target-correct", "live-target-wrong");
  }
  cards.forEach((card, idx) => {
    card.classList.remove("live-selected", "live-correct", "live-wrong", "live-pulse");
    if (selectedChoice === null) {
      return;
    }
    if (idx === selectedChoice) {
      card.classList.add("live-selected", "live-pulse");
      if (judgedResult === "correct") {
        card.classList.add("live-correct");
      } else {
        card.classList.add("live-wrong");
      }
    }
  });
  if (target && selectedChoice !== null) {
    target.classList.add(judgedResult === "correct" ? "live-target-correct" : "live-target-wrong");
  }
}

function applyDeepStepInteraction(doc, slide) {
  if (!doc || slide.kind !== "deep_step") {
    return;
  }
  const interaction = state.slideInteractions?.[slide.id] || {};
  const selectedChoice = Number.isFinite(interaction.selectedChoice) ? Number(interaction.selectedChoice) : null;
  const judgedResult = interaction.judgedResult === "correct" ? "correct" : interaction.judgedResult === "incorrect" ? "incorrect" : null;
  const items = Array.from(doc.querySelectorAll(".deep-item"));
  items.forEach((item, idx) => {
    item.classList.remove("live-selected", "live-correct", "live-wrong", "live-pulse");
    if (selectedChoice === null || idx !== selectedChoice) {
      return;
    }
    item.classList.add("live-selected", "live-pulse");
    if (judgedResult === "correct") {
      item.classList.add("live-correct");
    } else if (judgedResult === "incorrect") {
      item.classList.add("live-wrong");
    }
  });
}

function applyDeepCompareInteraction(doc, slide) {
  if (!doc || slide.kind !== "deep_compare") {
    return;
  }
  const interaction = state.slideInteractions?.[slide.id] || {};
  const subStep = Number.isFinite(interaction.subStep)
    ? Number(interaction.subStep)
    : inferDefaultSubStep(slide);
  const pair = DEEP_COMPARE_STEPS[((subStep % DEEP_COMPARE_STEPS.length) + DEEP_COMPARE_STEPS.length) % DEEP_COMPARE_STEPS.length];
  const items = Array.from(doc.querySelectorAll(".deep-item"));
  items.forEach((item, idx) => {
    item.classList.remove("highlight");
    item.classList.toggle("live-highlight", pair.includes(idx));
  });
}

function clearDeepCompareBeatSync(doc) {
  if (!doc) {
    return;
  }
  doc.querySelectorAll(".deep-item.live-kick").forEach((item) => {
    item.classList.remove("live-kick");
  });
}

function applyDeepCompareBeatEmphasis(doc, slide, step16) {
  if (!doc || !slide || slide.kind !== "deep_compare") {
    clearDeepCompareBeatSync(doc);
    return;
  }

  const interaction = state.slideInteractions?.[slide.id] || {};
  const subStep = Number.isFinite(interaction.subStep)
    ? Number(interaction.subStep)
    : inferDefaultSubStep(slide);
  const pair = DEEP_COMPARE_STEPS[((subStep % DEEP_COMPARE_STEPS.length) + DEEP_COMPARE_STEPS.length) % DEEP_COMPARE_STEPS.length];
  const beatIndex = ((Number(step16) || 0) % 16 + 16) % 16;
  // Kick is on 0/8, so switch between the selected pair on each half bar.
  const activePairIndex = beatIndex < 8 ? 0 : 1;
  const kickTarget = pair[activePairIndex];

  const items = Array.from(doc.querySelectorAll(".deep-item"));
  items.forEach((item, idx) => {
    item.classList.toggle("live-kick", idx === kickTarget);
  });
}

function clearWorkBeatSync(doc) {
  if (!doc) {
    return;
  }
  doc.querySelectorAll(".option-card.live-kick").forEach((card) => {
    card.classList.remove("live-kick");
  });
}

function applyWorkBeatEmphasis(doc, slide, step16) {
  if (!doc || !slide || slide.kind !== "work") {
    clearWorkBeatSync(doc);
    return;
  }
  const cards = Array.from(doc.querySelectorAll(".option-card"));
  if (!cards.length) {
    return;
  }
  const beatIndex = ((Number(step16) || 0) % 16 + 16) % 16;
  const quarterBeat = Math.floor(beatIndex / 4);
  const rotationOrder = cards.length === 4 ? CLOCKWISE_ORDER_2X2 : cards.map((_, idx) => idx);
  const activeIndex = rotationOrder[quarterBeat % rotationOrder.length];
  cards.forEach((card, idx) => {
    card.classList.toggle("live-kick", idx === activeIndex);
  });
}

function applyBeatLinkedVisuals(doc, slide, step16) {
  if (!doc || !slide) {
    return;
  }

  if (slide.kind === "deep_compare" || slide.kind === "work") {
    applyBeatPulse(step16);
  } else {
    clearBeatPulse(doc);
  }

  if (slide.kind === "rhythm") {
    applyRhythmKickEmphasis(doc, slide, step16);
    clearWorkBeatSync(doc);
    return;
  }

  if (slide.kind === "deep_compare") {
    doc.querySelectorAll(".focus-card.live-kick").forEach((card) => {
      card.classList.remove("live-kick");
    });
    applyDeepCompareBeatEmphasis(doc, slide, step16);
    clearWorkBeatSync(doc);
    return;
  }

  if (slide.kind === "work") {
    doc.querySelectorAll(".focus-card.live-kick").forEach((card) => {
      card.classList.remove("live-kick");
    });
    clearDeepCompareBeatSync(doc);
    applyWorkBeatEmphasis(doc, slide, step16);
    return;
  }

  clearDeepCompareBeatSync(doc);
  clearWorkBeatSync(doc);
}

function applySlideInteraction() {
  const doc = getFrameDoc();
  const slide = WEEK1_SLIDES[Math.min(WEEK1_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!doc || !slide) {
    return;
  }
  ensureFrameLiveStyle(doc);
  applyWorkInteraction(doc, slide);
  applyDeepStepInteraction(doc, slide);
  applyDeepCompareInteraction(doc, slide);
  applyBeatLinkedVisuals(doc, slide, latestBeatStep16);

  if (slide.kind === "end") {
    const interaction = state.slideInteractions?.[slide.id] || {};
    if (interaction.endRevealAt && interaction.endRevealAt !== lastEndRevealAt) {
      revealEndFx();
      lastEndRevealAt = interaction.endRevealAt;
    } else if (!interaction.endRevealAt) {
      clearEndFx();
      lastEndRevealAt = null;
    }
  } else {
    clearEndFx();
    lastEndRevealAt = null;
  }
}

function bindTapInteraction() {
  const doc = getFrameDoc();
  const slide = WEEK1_SLIDES[Math.min(WEEK1_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!doc || !slide) {
    return;
  }
  if (slide.kind === "work") {
    const options = Array.from(doc.querySelectorAll(".option-card"));
    options.forEach((option, idx) => {
      option.style.cursor = "pointer";
      option.onclick = null;
      option.addEventListener("click", () => {
        bus.publishSignal("work-choice", {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          slideId: slide.id,
          choiceIndex: idx
        });
      });
    });
    return;
  }
  if (slide.kind === "deep_step") {
    const items = Array.from(doc.querySelectorAll(".deep-item"));
    items.forEach((item, idx) => {
      item.style.cursor = "pointer";
      item.onclick = null;
      item.addEventListener("click", () => {
        bus.publishSignal("deep-step-choice", {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          slideId: slide.id,
          choiceIndex: idx
        });
      });
    });
  }
}

bus.onState((incoming) => {
  applyState(incoming);
});

bus.onSignal((signal) => {
  if (!signal || signal.name !== "beat" || !signal.payload || signal.payload.id === lastBeatSignalId) {
    return;
  }
  const slide = WEEK1_SLIDES[Math.min(WEEK1_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!slide || signal.payload.slideId !== slide.id) {
    return;
  }
  lastBeatSignalId = signal.payload.id;
  latestBeatStep16 = Number(signal.payload.step16) || 0;
  const doc = getFrameDoc();
  if (!doc) {
    return;
  }
  applyBeatLinkedVisuals(doc, slide, latestBeatStep16);
});

const latest = bus.getLatestState();
if (latest?.payload) {
  applyState(latest.payload);
} else {
  render();
}

if (isEmbed) {
  document.body.classList.add("embed-bigscreen");
}

if (frame) {
  frame.addEventListener("load", () => {
    applySlideInteraction();
    bindTapInteraction();
  });
}

if (!isEmbed) {
  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", () => {
      toggleFullscreen().catch(() => {});
    });
  }
  document.addEventListener("fullscreenchange", updateFullscreenButtonLabel);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButtonLabel);
  updateFullscreenButtonLabel();

  window.setInterval(() => {
    bus.publishPresence("bigscreen");
  }, 1_500);
  bus.publishPresence("bigscreen");
}

window.addEventListener("beforeunload", () => {
  if (endAudioTimer) {
    window.clearTimeout(endAudioTimer);
    endAudioTimer = null;
  }
  if (endIntroTimer) {
    window.clearTimeout(endIntroTimer);
    endIntroTimer = null;
  }
  if (endRollAudio) {
    endRollAudio.pause();
    endRollAudio = null;
  }
  if (endCymbalAudio) {
    endCymbalAudio.pause();
    endCymbalAudio = null;
  }
  if (fxAudio) {
    fxAudio.close().catch(() => {});
    fxAudio = null;
  }
  bus.close();
});
