import { WEEK9_SLIDES, WORK_PHASES, getWorkDisplayState } from "./lessonData.js";
import { SessionBus, defaultSessionId } from "../week5/sessionBus.js";
import { resolveAppUrl } from "../week5/utils.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session") || defaultSessionId("week9");
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
const reconnectButton = document.querySelector("[data-testid='bigscreen-reconnect-btn']");
const syncChip = document.querySelector("[data-testid='bigscreen-sync-chip']");

let state = {
  slideIndex: 0,
  studentPoints: 0,
  teacherPoints: 0,
  slideInteractions: {},
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
let lastEndRevealAt = null;
let syncDiagnostics = bus.getDiagnostics();
let workAnimationTimer = null;

const POINT_FX_DURATION_MS = 1900;
const END_ROLL_START_DELAY_MS = 3000;
const END_CYMBAL_DELAY_MS = 1300;

function currentSlide() {
  const index = Math.min(WEEK9_SLIDES.length - 1, Math.max(0, state.slideIndex || 0));
  return WEEK9_SLIDES[index] || WEEK9_SLIDES[0];
}

function render() {
  const slide = currentSlide();
  if (!slide) {
    return;
  }

  if (frame && frame.getAttribute("src") !== slide.screenPath) {
    frame.setAttribute("src", slide.screenPath);
  }

  if (slideCount) {
    slideCount.textContent = `${state.slideIndex + 1} / ${WEEK9_SLIDES.length}`;
  }
  if (pointHeader) {
    pointHeader.textContent = `みんな ${state.studentPoints ?? 0} / むつみ先生 ${state.teacherPoints ?? 0}`;
  }

  syncWorkAnimationLoop(slide);
  applySlideInteraction();
  updateSyncDiagnostics();
}

function formatElapsedFrom(ts) {
  if (!Number.isFinite(ts) || ts <= 0) {
    return "-";
  }
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) {
    return `${diffSec}s`;
  }
  const min = Math.floor(diffSec / 60);
  const sec = diffSec % 60;
  return `${min}m${sec}s`;
}

function labelPeerState(peerState) {
  switch (peerState) {
    case "open":
      return "OK";
    case "loading":
      return "LOAD";
    case "restarting":
      return "RESTART";
    case "reconnecting":
    case "disconnected":
      return "RETRY";
    case "unavailable":
      return "OFF";
    case "error":
      return "ERR";
    case "closed":
      return "STOP";
    default:
      return peerState || "-";
  }
}

function labelRemoteState(remoteState) {
  switch (remoteState) {
    case "connected":
      return "接続中";
    case "connecting":
      return "接続中...";
    case "waiting":
      return "待機";
    case "reconnecting":
      return "再接続";
    case "disabled":
      return "OFF";
    case "closed":
      return "停止";
    default:
      return remoteState || "-";
  }
}

function updateSyncDiagnostics() {
  const diagnostics = syncDiagnostics || bus.getDiagnostics();
  const remoteConnected = diagnostics.remoteState === "connected";
  if (mirrorStatus) {
    mirrorStatus.textContent = remoteConnected ? "Mirror Connected" : "Mirror Waiting";
    mirrorStatus.classList.toggle("hot", remoteConnected);
  }
  if (syncChip) {
    const remoteLabel = labelRemoteState(diagnostics.remoteState);
    const peerLabel = labelPeerState(diagnostics.peerState);
    const up = formatElapsedFrom(diagnostics.lastOutboundAt);
    const down = formatElapsedFrom(diagnostics.lastInboundAt);
    const suffix = diagnostics.lastError ? ` err:${diagnostics.lastError}` : "";
    syncChip.textContent = `接続:${remoteLabel} Peer:${peerLabel} ↑${up} ↓${down}${suffix}`;
    syncChip.classList.toggle("hot", remoteConnected);
  }
  if (reconnectButton) {
    const busy = diagnostics.peerState === "loading" || diagnostics.peerState === "restarting";
    reconnectButton.disabled = busy;
    reconnectButton.textContent = busy ? "再接続中..." : "再接続";
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

  notes.forEach((freq, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.06);
    gain.gain.setValueAtTime(0.0001, now + index * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.06 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.16);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now + index * 0.06);
    osc.stop(now + index * 0.06 + 0.18);
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

function syncWorkAnimationLoop(slide) {
  const interaction = state.slideInteractions?.[slide.id] || {};
  const phase = Number.isFinite(interaction.subStep) ? Number(interaction.subStep) : WORK_PHASES.IDLE;
  const shouldAnimate =
    slide.kind === "work" &&
    (phase === WORK_PHASES.SUBJECT_SPINNING || phase === WORK_PHASES.PREDICATE_SPINNING);

  if (!shouldAnimate) {
    if (workAnimationTimer) {
      window.clearInterval(workAnimationTimer);
      workAnimationTimer = null;
    }
    return;
  }

  if (workAnimationTimer) {
    return;
  }

  workAnimationTimer = window.setInterval(() => {
    applySlideInteraction();
  }, 100);
}

function renderWorkRoulette(doc, slide) {
  if (!doc || slide.kind !== "work") {
    return;
  }

  const display = getWorkDisplayState(state.slideInteractions?.[slide.id] || {}, slide.phase, Date.now());
  const subjectSlot = doc.querySelector("[data-role='work-subject-slot']");
  const predicateSlot = doc.querySelector("[data-role='work-predicate-slot']");
  const subjectShell = doc.querySelector("[data-role='subject-slot-shell']");
  const predicateShell = doc.querySelector("[data-role='predicate-slot-shell']");
  const status = doc.querySelector("[data-role='work-status']");
  const sentence = doc.querySelector("[data-role='work-sentence']");
  const resultCard = doc.querySelector("[data-role='work-result-card']");
  const image = doc.querySelector("[data-role='work-image']");
  const imageShell = doc.querySelector("[data-role='work-image-shell']");
  const imageFallback = doc.querySelector("[data-role='work-image-fallback']");

  if (subjectSlot) {
    subjectSlot.textContent = display.subject ? (slide.phase === "jp" ? display.subject.jp : display.subject.en) : "?";
  }
  if (predicateSlot) {
    predicateSlot.textContent = display.predicate
      ? slide.phase === "jp"
        ? display.predicate.jp
        : display.predicate.en
      : "?";
  }
  if (subjectShell) {
    subjectShell.classList.toggle("is-live", display.phase === WORK_PHASES.SUBJECT_SPINNING);
  }
  if (predicateShell) {
    predicateShell.classList.toggle("is-live", display.phase === WORK_PHASES.PREDICATE_SPINNING);
  }
  if (status) {
    status.textContent = display.status;
  }
  if (sentence) {
    sentence.textContent = display.phase === WORK_PHASES.REVEALED ? display.sentence : "";
  }
  if (resultCard) {
    resultCard.classList.toggle("is-hidden", display.phase !== WORK_PHASES.REVEALED);
  }
  if (imageShell) {
    imageShell.classList.remove("missing");
  }
  if (imageFallback) {
    imageFallback.textContent =
      display.phase === WORK_PHASES.REVEALED
        ? slide.phase === "jp"
          ? "イラストが まだ ないよ"
          : "Illustration is not ready yet."
        : "";
  }
  if (image) {
    if (display.phase === WORK_PHASES.REVEALED && display.imagePath) {
      image.hidden = false;
      image.setAttribute("src", resolveAppUrl(display.imagePath));
      image.setAttribute("alt", display.sentence);
    } else {
      image.hidden = true;
      image.removeAttribute("src");
      image.setAttribute("alt", "");
    }
  }
}

function applySlideInteraction() {
  const doc = getFrameDoc();
  const slide = currentSlide();
  if (!doc || !slide) {
    return;
  }

  if (slide.kind === "work") {
    renderWorkRoulette(doc, slide);
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

bus.onState((incoming) => {
  applyState(incoming);
});

bus.onDiagnostics((next) => {
  syncDiagnostics = next;
  updateSyncDiagnostics();
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
  });
}

if (!isEmbed) {
  if (reconnectButton) {
    reconnectButton.addEventListener("click", () => {
      bus.forceReconnect();
      syncDiagnostics = bus.getDiagnostics();
      updateSyncDiagnostics();
    });
  }
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
    updateSyncDiagnostics();
  }, 1_500);
  bus.publishPresence("bigscreen");
}

window.addEventListener("beforeunload", () => {
  if (pointFxTimer) {
    window.clearTimeout(pointFxTimer);
    pointFxTimer = null;
  }
  if (endAudioTimer) {
    window.clearTimeout(endAudioTimer);
    endAudioTimer = null;
  }
  if (endIntroTimer) {
    window.clearTimeout(endIntroTimer);
    endIntroTimer = null;
  }
  if (workAnimationTimer) {
    window.clearInterval(workAnimationTimer);
    workAnimationTimer = null;
  }
  bus.close();
});

const endState = state.slideInteractions?.[currentSlide()?.id || ""] || {};
if (currentSlide()?.kind === "end" && endState.endRevealAt && !lastEndRevealAt) {
  triggerEndFx();
}
