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
const fullscreenButton = document.querySelector("[data-testid='fullscreen-btn']");

let state = {
  slideIndex: 0,
  studentPoints: 0,
  teacherPoints: 0,
  updatedAt: 0
};
let pointFxTimer = null;
let fxAudio = null;
let hydratedPoints = false;
let lastPoints = {
  studentPoints: 0,
  teacherPoints: 0
};

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
  const notes = type === "student" ? [880, 1175, 1568] : [587, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.setValueAtTime(0.0001, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.07, now + i * 0.06 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.14);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.16);
  });
}

function triggerPointFx(type, delta) {
  if (isEmbed) {
    return;
  }

  if (!pointFx || !pointFxLabel) {
    return;
  }

  if (pointFxTimer) {
    window.clearTimeout(pointFxTimer);
    pointFxTimer = null;
  }

  pointFx.classList.remove("student", "teacher", "active");
  pointFx.classList.add(type);
  pointFxLabel.textContent = `${type === "student" ? "みんな" : "むつみせんせい"} +${delta}`;
  void pointFx.offsetWidth;
  pointFx.classList.add("active");
  playPointFxSound(type);

  pointFxTimer = window.setTimeout(() => {
    pointFx.classList.remove("active", "student", "teacher");
    pointFxTimer = null;
  }, 700);
}

function triggerPointFxIfNeeded(incoming) {
  if (isEmbed) {
    lastPoints = {
      studentPoints: incoming.studentPoints ?? 0,
      teacherPoints: incoming.teacherPoints ?? 0
    };
    hydratedPoints = true;
    return;
  }

  if (!hydratedPoints) {
    lastPoints = {
      studentPoints: incoming.studentPoints ?? 0,
      teacherPoints: incoming.teacherPoints ?? 0
    };
    hydratedPoints = true;
    return;
  }

  if ((incoming.studentPoints ?? 0) > (lastPoints.studentPoints ?? 0)) {
    triggerPointFx("student", (incoming.studentPoints ?? 0) - (lastPoints.studentPoints ?? 0));
  } else if ((incoming.teacherPoints ?? 0) > (lastPoints.teacherPoints ?? 0)) {
    triggerPointFx("teacher", (incoming.teacherPoints ?? 0) - (lastPoints.teacherPoints ?? 0));
  }

  lastPoints = {
    studentPoints: incoming.studentPoints ?? 0,
    teacherPoints: incoming.teacherPoints ?? 0
  };
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

  triggerPointFxIfNeeded(state);
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
  if (fxAudio) {
    fxAudio.close().catch(() => {});
    fxAudio = null;
  }
  bus.close();
});
