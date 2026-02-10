import "./styles.css";
import {
  FLOW_STEPS,
  LESSON_GOALS,
  WEEK5_SLIDES,
  findSlideIndexById,
  stepIndexForSlide
} from "./lessonData.js";
import { Week5AudioEngine } from "./audioEngine.js";
import { SessionBus, defaultSessionId } from "./sessionBus.js";
import { LESSON_DURATION_SECONDS, clamp, formatLessonTimer, nowMs, resolveAppPath } from "./utils.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session") || defaultSessionId();
const initialSlideId = params.get("slide");

const bus = new SessionBus(sessionId);
const audio = new Week5AudioEngine();

const fallbackState = {
  slideIndex: 0,
  studentPoints: 0,
  teacherPoints: 0,
  bgmEnabled: true,
  timerRunning: true,
  timerOffsetSec: 0,
  timerStartedAt: nowMs(),
  updatedAt: nowMs()
};

const latest = bus.getLatestState();
let state = latest?.payload && typeof latest.payload === "object" ? { ...fallbackState, ...latest.payload } : fallbackState;

if (initialSlideId) {
  const idx = findSlideIndexById(initialSlideId);
  if (idx >= 0) {
    state.slideIndex = idx;
  }
}
state.slideIndex = clamp(state.slideIndex, 0, WEEK5_SLIDES.length - 1);

function normalizeTimerState(rawState) {
  const normalized = { ...rawState };
  const now = nowMs();

  if (
    typeof normalized.timerRunning !== "boolean" ||
    typeof normalized.timerOffsetSec !== "number" ||
    !(normalized.timerStartedAt === null || typeof normalized.timerStartedAt === "number")
  ) {
    if (typeof normalized.startedAt === "number") {
      const migratedElapsed = clamp(
        Math.floor((now - normalized.startedAt) / 1000),
        0,
        LESSON_DURATION_SECONDS
      );
      normalized.timerOffsetSec = migratedElapsed;
      normalized.timerRunning = migratedElapsed < LESSON_DURATION_SECONDS;
      normalized.timerStartedAt = normalized.timerRunning ? now : null;
    } else {
      normalized.timerRunning = true;
      normalized.timerOffsetSec = 0;
      normalized.timerStartedAt = now;
    }
  }

  normalized.timerOffsetSec = clamp(
    Number.isFinite(normalized.timerOffsetSec) ? Math.floor(normalized.timerOffsetSec) : 0,
    0,
    LESSON_DURATION_SECONDS
  );

  if (normalized.timerRunning) {
    if (!Number.isFinite(normalized.timerStartedAt)) {
      normalized.timerStartedAt = now;
    }
    if (normalized.timerOffsetSec >= LESSON_DURATION_SECONDS) {
      normalized.timerRunning = false;
      normalized.timerStartedAt = null;
    }
  } else {
    normalized.timerStartedAt = null;
  }

  if ("startedAt" in normalized) {
    delete normalized.startedAt;
  }

  return normalized;
}

state = normalizeTimerState(state);

const elements = {
  scaleRoot: document.querySelector("[data-role='runner-scale']"),
  mirrorChip: document.querySelector("[data-role='mirror-chip']"),
  slideCounter: document.querySelector("[data-testid='slide-counter']"),
  timer: document.querySelector("[data-testid='lesson-timer']"),
  timerStartButton: document.querySelector("[data-testid='timer-start-btn']"),
  timerStopButton: document.querySelector("[data-testid='timer-stop-btn']"),
  timerResetButton: document.querySelector("[data-testid='timer-reset-btn']"),
  flowSteps: document.querySelector("[data-role='flow-steps']"),
  goals: document.querySelector("[data-role='goal-grid']"),
  previewFrame: document.querySelector("[data-testid='stage-preview-frame']"),
  previewLabel: document.querySelector("[data-testid='stage-preview-label']"),
  hintPhase: document.querySelector("[data-testid='hint-phase']"),
  hintId: document.querySelector("[data-testid='hint-id']"),
  hintTitle: document.querySelector("[data-testid='hint-title']"),
  hintAim: document.querySelector("[data-testid='hint-aim']"),
  hintScript: document.querySelector("[data-testid='hint-script']"),
  hintList: document.querySelector("[data-testid='hint-list']"),
  studentPoints: document.querySelector("[data-testid='student-points']"),
  teacherPoints: document.querySelector("[data-testid='teacher-points']"),
  nextButton: document.querySelector("[data-testid='next-btn']"),
  prevButton: document.querySelector("[data-testid='prev-btn']"),
  studentPointButton: document.querySelector("[data-testid='student-point-btn']"),
  teacherPointButton: document.querySelector("[data-testid='teacher-point-btn']"),
  correctButton: document.querySelector("[data-testid='correct-btn']"),
  incorrectButton: document.querySelector("[data-testid='incorrect-btn']"),
  resetPointsButton: document.querySelector("[data-testid='reset-points-btn']"),
  openBigButton: document.querySelector("[data-testid='open-bigscreen-btn']"),
  soundButton: document.querySelector("[data-testid='sound-btn']")
};

let activeHintButton = null;
let mirrorLastSeenAt = 0;
let audioReady = false;
const BIGSCREEN_BASE_WIDTH = 1512;
const BIGSCREEN_BASE_HEIGHT = 982;

function buildFlowSteps() {
  elements.flowSteps.innerHTML = FLOW_STEPS.map(
    (step) => `<span class='flow-step' data-step-id='${step.id}'>${step.label}</span>`
  ).join("");
}

function buildGoals() {
  elements.goals.innerHTML = LESSON_GOALS.map(
    (goal) => `<div class='goal-item'><strong>${goal.id}</strong><p>${goal.text}</p></div>`
  ).join("");
}

function buildHintList() {
  elements.hintList.innerHTML = "";
  WEEK5_SLIDES.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "hint-item";
    button.type = "button";
    button.textContent = `${index + 1}. ${slide.id}`;
    button.dataset.slideIndex = String(index);
    button.addEventListener("click", async () => {
      await ensureAudioReady();
      audio.playNavigate();
      setState({ slideIndex: index });
    });
    elements.hintList.appendChild(button);
  });
}

function currentSlide() {
  return WEEK5_SLIDES[state.slideIndex] || WEEK5_SLIDES[0];
}

function lessonElapsedSeconds() {
  const runningElapsed =
    state.timerRunning && state.timerStartedAt
      ? Math.floor((nowMs() - state.timerStartedAt) / 1000)
      : 0;
  return clamp(state.timerOffsetSec + runningElapsed, 0, LESSON_DURATION_SECONDS);
}

function updateFlowHighlight(slide) {
  const activeIndex = stepIndexForSlide(slide);
  const chips = elements.flowSteps.querySelectorAll(".flow-step");
  chips.forEach((chip, index) => {
    chip.classList.toggle("active", index === activeIndex);
  });
}

function updateHintPanel(slide) {
  elements.hintPhase.textContent = slide.modeLabel;
  elements.hintId.textContent = slide.id;
  elements.hintTitle.textContent = slide.hint.title;
  elements.hintAim.textContent = slide.hint.aim;
  elements.hintScript.textContent = slide.hint.script;

  if (activeHintButton) {
    activeHintButton.classList.remove("active");
  }

  activeHintButton = elements.hintList.querySelector(`[data-slide-index='${state.slideIndex}']`);
  if (activeHintButton) {
    activeHintButton.classList.add("active");
    activeHintButton.scrollIntoView({ block: "nearest" });
  }
}

function updatePreview(slide) {
  elements.previewLabel.textContent = `${slide.id} / ${slide.hint.title}`;
}

function initializePreviewFrame() {
  const baseUrl = resolveAppPath("week5-big-screen.html");
  const url = `${baseUrl}?session=${encodeURIComponent(sessionId)}&embed=1`;
  if (elements.previewFrame.getAttribute("src") !== url) {
    elements.previewFrame.setAttribute("src", url);
  }
}

function makeFxEvent(kind) {
  return {
    id: `${nowMs()}-${Math.random().toString(16).slice(2, 8)}`,
    kind
  };
}

function fitPreviewScale() {
  if (!elements.previewFrame) {
    return;
  }

  const frameEl = elements.previewFrame.closest(".stage-preview-frame");
  if (!frameEl) {
    return;
  }

  const scale = Math.min(
    frameEl.clientWidth / BIGSCREEN_BASE_WIDTH,
    frameEl.clientHeight / BIGSCREEN_BASE_HEIGHT
  );

  elements.previewFrame.style.setProperty("--preview-scale", String(scale));
}

function updateTimer() {
  elements.timer.textContent = formatLessonTimer(lessonElapsedSeconds());
}

function updateTimerButtons() {
  if (!elements.timerStartButton || !elements.timerStopButton || !elements.timerResetButton) {
    return;
  }

  elements.timerStartButton.classList.toggle("active", state.timerRunning);
  elements.timerStopButton.classList.toggle("active", !state.timerRunning);
  elements.timerResetButton.classList.remove("active");
}

function updateScore() {
  if (elements.studentPoints) {
    elements.studentPoints.textContent = String(state.studentPoints);
  }
  if (elements.teacherPoints) {
    elements.teacherPoints.textContent = String(state.teacherPoints);
  }
}

function updateMirrorChip() {
  const connected = nowMs() - mirrorLastSeenAt < 4_500;
  elements.mirrorChip.textContent = connected ? "Mirror Connected" : "Mirror Waiting";
  elements.mirrorChip.classList.toggle("hot", connected);
}

function updateSoundButtons() {
  if (!audioReady) {
    elements.soundButton.textContent = "サウンド開始";
    elements.soundButton.classList.remove("hot");
    return;
  }

  elements.soundButton.textContent = state.bgmEnabled ? "サウンド/BGM ON" : "サウンド/BGM OFF";
  elements.soundButton.classList.toggle("hot", state.bgmEnabled);
}

function fitRunnerScale() {
  if (!elements.scaleRoot) {
    return;
  }

  elements.scaleRoot.style.width = "";
  elements.scaleRoot.style.transform = "";
  elements.scaleRoot.style.marginTop = "";
  elements.scaleRoot.style.marginLeft = "";
  elements.scaleRoot.style.marginRight = "";
  fitPreviewScale();
}

function applyAudioBySlide(slide) {
  if (!audioReady) {
    return;
  }

  audio.setBgmEnabled(state.bgmEnabled);
  if (typeof slide.bpm === "number" && slide.bpm > 0) {
    audio.setMetronome(slide.bpm);
  } else {
    audio.setMetronome(null);
  }
}

function render() {
  const slide = currentSlide();
  elements.slideCounter.textContent = `${state.slideIndex + 1} / ${WEEK5_SLIDES.length}`;
  updateFlowHighlight(slide);
  updateHintPanel(slide);
  updatePreview(slide);
  updateTimer();
  updateTimerButtons();
  updateScore();
  updateMirrorChip();
  updateSoundButtons();
  applyAudioBySlide(slide);
  fitPreviewScale();
}

function setState(patch, { broadcast = true } = {}) {
  state = normalizeTimerState({
    ...state,
    ...patch,
    slideIndex: clamp(patch.slideIndex ?? state.slideIndex, 0, WEEK5_SLIDES.length - 1),
    updatedAt: nowMs()
  });

  render();

  if (broadcast) {
    bus.publishState(state);
  }
}

async function ensureAudioReady() {
  if (audioReady) {
    return;
  }
  audioReady = await audio.unlock();
  if (audioReady) {
    applyAudioBySlide(currentSlide());
  }
  updateSoundButtons();
}

async function goNext() {
  await ensureAudioReady();
  audio.playNavigate();
  setState({ slideIndex: state.slideIndex + 1 });
}

async function goPrev() {
  await ensureAudioReady();
  audio.playNavigate();
  setState({ slideIndex: state.slideIndex - 1 });
}

async function startOrResumeTimer() {
  await ensureAudioReady();
  audio.playToggle();
  const elapsed = lessonElapsedSeconds();
  setState({
    timerOffsetSec: elapsed >= LESSON_DURATION_SECONDS ? 0 : elapsed,
    timerRunning: true,
    timerStartedAt: nowMs()
  });
}

async function stopTimer() {
  await ensureAudioReady();
  audio.playToggle();
  setState({
    timerOffsetSec: lessonElapsedSeconds(),
    timerRunning: false,
    timerStartedAt: null
  });
}

async function resetTimer() {
  await ensureAudioReady();
  audio.playNavigate();
  setState({
    timerOffsetSec: 0,
    timerRunning: false,
    timerStartedAt: null
  });
}

function handleArrowKey(event) {
  if (event.defaultPrevented) {
    return;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  ) {
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    goNext();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goPrev();
  }
}

async function setupControls() {
  elements.nextButton.addEventListener("click", goNext);

  elements.prevButton.addEventListener("click", goPrev);

  if (elements.timerStartButton) {
    elements.timerStartButton.addEventListener("click", startOrResumeTimer);
  }
  if (elements.timerStopButton) {
    elements.timerStopButton.addEventListener("click", stopTimer);
  }
  if (elements.timerResetButton) {
    elements.timerResetButton.addEventListener("click", resetTimer);
  }

  elements.studentPointButton.addEventListener("click", async () => {
    await ensureAudioReady();
    audio.playPoint("student");
    setState({
      studentPoints: state.studentPoints + 1,
      fxEvent: makeFxEvent("student")
    });
  });

  elements.teacherPointButton.addEventListener("click", async () => {
    await ensureAudioReady();
    audio.playPoint("teacher");
    setState({
      teacherPoints: state.teacherPoints + 1,
      fxEvent: makeFxEvent("teacher")
    });
  });

  if (elements.correctButton) {
    elements.correctButton.addEventListener("click", async () => {
      await ensureAudioReady();
      audio.playCorrect();
      setState({ fxEvent: makeFxEvent("correct") });
    });
  }

  if (elements.incorrectButton) {
    elements.incorrectButton.addEventListener("click", async () => {
      await ensureAudioReady();
      audio.playIncorrect();
      setState({ fxEvent: makeFxEvent("incorrect") });
    });
  }

  if (elements.resetPointsButton) {
    elements.resetPointsButton.addEventListener("click", async () => {
      await ensureAudioReady();
      audio.playNavigate();
      setState({
        studentPoints: 0,
        teacherPoints: 0
      });
    });
  }

  elements.soundButton.addEventListener("click", async () => {
    const wasReady = audioReady;
    await ensureAudioReady();
    if (!audioReady) {
      return;
    }
    if (!wasReady) {
      render();
      return;
    }
    audio.playToggle();
    setState({ bgmEnabled: !state.bgmEnabled });
  });

  elements.openBigButton.addEventListener("click", () => {
    const url = `${resolveAppPath("week5-big-screen.html")}?session=${encodeURIComponent(sessionId)}`;
    window.open(url, "week5-bigscreen", "noopener,noreferrer");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      return;
    }
    render();
  });

  window.addEventListener("keydown", handleArrowKey);
}

function setupRealtimeSync() {
  bus.onState((incoming) => {
    if (!incoming || typeof incoming !== "object") {
      return;
    }
    const normalizedIncoming = normalizeTimerState(incoming);
    if ((normalizedIncoming.updatedAt || 0) <= (state.updatedAt || 0)) {
      return;
    }
    state = normalizeTimerState({ ...state, ...normalizedIncoming });
    render();
  });

  bus.onPresence((presence) => {
    if (presence.role !== "bigscreen") {
      return;
    }
    mirrorLastSeenAt = nowMs();
    updateMirrorChip();
  });

  window.setInterval(() => {
    if (state.timerRunning && lessonElapsedSeconds() >= LESSON_DURATION_SECONDS) {
      setState({
        timerRunning: false,
        timerOffsetSec: LESSON_DURATION_SECONDS,
        timerStartedAt: null
      });
      return;
    }
    updateMirrorChip();
    updateTimer();
    updateTimerButtons();
  }, 500);
}

function bootstrap() {
  buildFlowSteps();
  buildGoals();
  buildHintList();
  initializePreviewFrame();
  fitRunnerScale();
  setupControls();
  setupRealtimeSync();
  window.addEventListener("resize", fitRunnerScale);

  render();
  bus.publishState(state);
}

bootstrap();

window.addEventListener("beforeunload", () => {
  window.removeEventListener("resize", fitRunnerScale);
  window.removeEventListener("keydown", handleArrowKey);
  audio.destroy();
  bus.close();
});
