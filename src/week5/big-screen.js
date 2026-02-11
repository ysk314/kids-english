import "./styles.css";
import { WEEK5_SLIDES } from "./lessonData.js";
import { SessionBus, defaultSessionId } from "./sessionBus.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session") || defaultSessionId();
const isEmbed = params.get("embed") === "1";

const bus = new SessionBus(sessionId);
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
let lastEndRevealAt = null;

const END_ROLL_START_DELAY_MS = 3000;
const END_CYMBAL_DELAY_MS = 1300;
const DEEP_COMPARE_STEPS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 3]
];

function resolveAssetUrl(pathname) {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin).toString();
}

function render() {
  const index = Math.min(WEEK5_SLIDES.length - 1, Math.max(0, state.slideIndex || 0));
  const slide = WEEK5_SLIDES[index];
  if (!slide) {
    return;
  }

  const nextSrc = slide.screenPath;
  if (frame.getAttribute("src") !== nextSrc) {
    frame.setAttribute("src", nextSrc);
  }

  slideCount.textContent = `${index + 1} / ${WEEK5_SLIDES.length}`;
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
    endRollAudio = new Audio(resolveAssetUrl("mockup/assets/audio/end_drum_roll.mp3"));
    endRollAudio.preload = "auto";
    endCymbalAudio = new Audio(resolveAssetUrl("mockup/assets/audio/end_cymbal.mp3"));
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
  }, 700);
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
    triggerPointFx("student", "みんな +1");
    return;
  }
  if (fxEvent.kind === "teacher") {
    triggerPointFx("teacher", "むつみせんせい +1");
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
    .target-large.live-target-correct,
    .focus-card.live-target-correct {
      box-shadow: 0 0 0 5px rgba(62, 202, 130, 0.25);
    }
    .target-large.live-target-wrong,
    .focus-card.live-target-wrong {
      box-shadow: 0 0 0 5px rgba(235, 78, 98, 0.22);
    }
    .deep-item.live-highlight {
      border-color: #ff4f7d !important;
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.24);
    }
    .flow-progress span.live-beat {
      background: #fff38e !important;
      box-shadow: 0 0 14px rgba(255, 241, 140, 0.78);
    }
    .focus-card.live-kick {
      border-color: #ffd95a !important;
      box-shadow: 0 0 0 5px rgba(255, 217, 90, 0.28), 0 12px 24px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    }
    @keyframes live-pop {
      0% { transform: scale(0.94); }
      55% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
  `;
  doc.head.appendChild(style);
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
  if (slide.id.includes("rhythm_summary")) {
    doc.querySelectorAll(".focus-card.live-kick").forEach((card) => {
      card.classList.remove("live-kick");
    });
    return;
  }
  const cards = Array.from(doc.querySelectorAll(".focus-card"));
  if (cards.length < 2) {
    return;
  }
  const activeIndex = step16 < 8 ? 0 : 1;
  cards.forEach((card, idx) => {
    card.classList.toggle("live-kick", idx === activeIndex);
  });
}

function applyWorkInteraction(doc, slide) {
  if (!doc || slide.kind !== "work") {
    return;
  }
  const interaction = state.slideInteractions?.[slide.id] || {};
  const selectedChoice = Number.isFinite(interaction.selectedChoice) ? Number(interaction.selectedChoice) : null;
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
    }
    if (idx === slide.correctIndex) {
      card.classList.add("live-correct");
    }
    if (idx === selectedChoice && selectedChoice !== slide.correctIndex) {
      card.classList.add("live-wrong");
    }
  });
  if (target && selectedChoice !== null) {
    target.classList.add(selectedChoice === slide.correctIndex ? "live-target-correct" : "live-target-wrong");
  }
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
    item.classList.toggle("live-highlight", pair.includes(idx));
  });
}

function applySlideInteraction() {
  const doc = getFrameDoc();
  const slide = WEEK5_SLIDES[Math.min(WEEK5_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!doc || !slide) {
    return;
  }
  ensureFrameLiveStyle(doc);
  applyWorkInteraction(doc, slide);
  applyDeepCompareInteraction(doc, slide);
  if (slide.kind === "rhythm" || slide.kind === "deep_compare") {
    applyBeatPulse(latestBeatStep16);
    applyRhythmKickEmphasis(doc, slide, latestBeatStep16);
  } else {
    clearBeatPulse(doc);
  }

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

function bindWorkTapInteraction() {
  const doc = getFrameDoc();
  const slide = WEEK5_SLIDES[Math.min(WEEK5_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!doc || !slide || slide.kind !== "work") {
    return;
  }
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
}

bus.onState((incoming) => {
  applyState(incoming);
});

bus.onSignal((signal) => {
  if (!signal || signal.name !== "beat" || !signal.payload || signal.payload.id === lastBeatSignalId) {
    return;
  }
  const slide = WEEK5_SLIDES[Math.min(WEEK5_SLIDES.length - 1, Math.max(0, state.slideIndex || 0))];
  if (!slide || signal.payload.slideId !== slide.id) {
    return;
  }
  lastBeatSignalId = signal.payload.id;
  latestBeatStep16 = Number(signal.payload.step16) || 0;
  const doc = getFrameDoc();
  if (!doc) {
    return;
  }
  if (slide.kind === "rhythm" || slide.kind === "deep_compare") {
    applyBeatPulse(latestBeatStep16);
    applyRhythmKickEmphasis(doc, slide, latestBeatStep16);
  }
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
    bindWorkTapInteraction();
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
