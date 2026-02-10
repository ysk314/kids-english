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
let endFxTimer = null;
let fxAudio = null;
let endRollAudio = null;
let endCymbalAudio = null;
let endAudioTimer = null;
let endIntroTimer = null;
let hydratedFx = false;
let lastFxId = "";
let lastSlideId = "";

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

  const previousSlideId = lastSlideId;
  lastSlideId = slide.id;
  if (slide.kind === "end" && previousSlideId && previousSlideId !== slide.id) {
    triggerEndFx();
  } else if (slide.kind !== "end") {
    clearEndFx();
  }
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
  if (isEmbed) {
    return;
  }
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

  try {
    endRollAudio.currentTime = 0;
    const rollPromise = endRollAudio.play();
    if (rollPromise && typeof rollPromise.catch === "function") {
      rollPromise.catch(() => {});
    }
  } catch {
    // no-op
  }

  endAudioTimer = window.setTimeout(() => {
    if (endRollAudio) {
      endRollAudio.pause();
    }
    if (endCymbalAudio) {
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
    endAudioTimer = null;
  }, 1300);
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
  if (endFxTimer) {
    window.clearTimeout(endFxTimer);
    endFxTimer = null;
  }

  endFxLabel.innerHTML = `けっか はっぴょう！<br>みんな ${state.studentPoints ?? 0} てん<br>むつみせんせい ${state.teacherPoints ?? 0} てん`;
  endFx.classList.remove("burst");
  void endFx.offsetWidth;
  endFx.classList.add("show", "burst");

  endFxTimer = window.setTimeout(() => {
    endFx.classList.remove("burst");
    endFxTimer = null;
  }, 2600);

  if (endIntroTimer) {
    window.clearTimeout(endIntroTimer);
    endIntroTimer = null;
  }

  endIntroTimer = window.setTimeout(() => {
    playEndFanfare();
    endIntroTimer = null;
  }, 500);
}

function clearEndFx() {
  if (!endFx) {
    return;
  }
  endFx.classList.remove("show", "burst");
  if (endFxTimer) {
    window.clearTimeout(endFxTimer);
    endFxTimer = null;
  }
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

bus.onState((incoming) => {
  applyState(incoming);
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
