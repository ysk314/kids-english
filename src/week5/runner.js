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

const bus = new SessionBus(sessionId, {
  role: "runner"
});
const audio = new Week5AudioEngine();

const fallbackState = {
  slideIndex: 0,
  studentPoints: 0,
  teacherPoints: 0,
  slideInteractions: {},
  bgmEnabled: true,
  timerRunning: false,
  timerOffsetSec: 0,
  timerStartedAt: null,
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

  if (!normalized.slideInteractions || typeof normalized.slideInteractions !== "object") {
    normalized.slideInteractions = {};
  }

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
      normalized.timerRunning = false;
      normalized.timerOffsetSec = 0;
      normalized.timerStartedAt = null;
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
  timerToggleButton: document.querySelector("[data-testid='timer-toggle-btn']"),
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
  lessonResetButton: document.querySelector("[data-testid='lesson-reset-btn']"),
  openBigButton: document.querySelector("[data-testid='open-bigscreen-btn']"),
  soundButton: document.querySelector("[data-testid='sound-btn']"),
  subPrevButton: document.querySelector("[data-testid='sub-prev-btn']"),
  subNextButton: document.querySelector("[data-testid='sub-next-btn']")
};

let activeHintButton = null;
let mirrorLastSeenAt = 0;
let audioReady = false;
let lastRenderedSlideId = "";
let beatSignalTimer = null;
let beatSignalStep = 0;
let beatSignalKey = "";
let endRevealTimer = null;
const END_CYMBAL_DELAY_MS = 1300;
let beatListenerBound = false;
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

function getSlideInteraction(slideId) {
  const interaction = state.slideInteractions?.[slideId];
  if (!interaction || typeof interaction !== "object") {
    return {};
  }
  return interaction;
}

function getSubStepMax(slide) {
  if (slide.kind === "deep_compare") {
    return 4;
  }
  if (slide.kind === "end") {
    return 2;
  }
  return 0;
}

function inferDefaultSubStep(slide) {
  if (slide.kind !== "deep_compare") {
    return 0;
  }
  const match = /deep_compare_(\d+)$/.exec(slide.id);
  if (!match) {
    return 0;
  }
  return clamp(Number(match[1]) - 1, 0, 3);
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
  elements.previewFrame.addEventListener("load", () => {
    const frameDoc = elements.previewFrame?.contentDocument;
    if (!frameDoc) {
      return;
    }
    frameDoc.addEventListener("keydown", handleArrowKey);
  });
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
  if (!elements.timerToggleButton || !elements.timerResetButton) {
    return;
  }

  elements.timerToggleButton.classList.toggle("active", state.timerRunning);
  elements.timerToggleButton.textContent = state.timerRunning ? "一時停止⏸️" : "スタート▶︎";
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

function updateSlideActionButtons(slide) {
  const maxStep = getSubStepMax(slide);
  const hasSubStep = maxStep > 0;
  const currentStep = Number(getSlideInteraction(slide.id).subStep ?? inferDefaultSubStep(slide));
  if (elements.subPrevButton && elements.subNextButton) {
    elements.subPrevButton.disabled = !hasSubStep && state.slideIndex <= 0;
    elements.subNextButton.disabled = !hasSubStep && state.slideIndex >= WEEK5_SLIDES.length - 1;
    if (slide.kind === "end") {
      elements.subPrevButton.textContent = `◀ スライド内 ${Math.min(currentStep + 1, maxStep)}/${maxStep}`;
      elements.subNextButton.textContent = currentStep > 0 ? "演出ずみ" : "けっかはっぴょう ▶";
      elements.subNextButton.disabled = currentStep > 0;
    } else {
      elements.subPrevButton.textContent = hasSubStep ? `◀ スライド内 ${currentStep + 1}/${maxStep}` : "◀ スライド内";
      elements.subNextButton.textContent = hasSubStep ? `スライド内 ${currentStep + 1}/${maxStep} ▶` : "スライド内 ▶";
    }
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

function stopBeatSignal() {
  if (beatSignalTimer) {
    window.clearInterval(beatSignalTimer);
    beatSignalTimer = null;
  }
}

function publishBeatSignal(step16, bpm, slideId) {
  bus.publishSignal("beat", {
    id: `${Date.now()}-${step16}`,
    step16: step16 % 16,
    bpm,
    slideId
  });
}

function syncBeatSignalBySlide(slide) {
  const bpm = typeof slide.bpm === "number" && slide.bpm > 0 ? slide.bpm : null;
  if (!bpm) {
    stopBeatSignal();
    beatSignalKey = "";
    return;
  }

  const key = `${slide.id}:${bpm}`;
  if (beatSignalKey === key && (beatSignalTimer || audioReady)) {
    return;
  }

  beatSignalKey = key;
  beatSignalStep = 0;
  publishBeatSignal(0, bpm, slide.id);

  if (audioReady) {
    stopBeatSignal();
    return;
  }

  stopBeatSignal();
  const intervalMs = Math.max(30, Math.floor(60_000 / bpm / 4));
  beatSignalTimer = window.setInterval(() => {
    publishBeatSignal(beatSignalStep, bpm, slide.id);
    beatSignalStep += 1;
  }, intervalMs);
}

function setSlideInteraction(slideId, patch) {
  const prev = getSlideInteraction(slideId);
  return {
    ...state.slideInteractions,
    [slideId]: {
      ...prev,
      ...patch
    }
  };
}

function createFreshLessonState() {
  return normalizeTimerState({
    ...fallbackState,
    bgmEnabled: state?.bgmEnabled ?? fallbackState.bgmEnabled,
    timerRunning: false,
    timerOffsetSec: 0,
    timerStartedAt: null,
    slideIndex: 0,
    studentPoints: 0,
    teacherPoints: 0,
    slideInteractions: {},
    fxEvent: null,
    updatedAt: nowMs()
  });
}

function shouldResetOnLoad() {
  const newFlag = params.get("new");
  const resetFlag = params.get("reset");
  return newFlag === "1" || resetFlag === "1";
}

function render() {
  const slide = currentSlide();
  if (slide.kind !== "end" && endRevealTimer) {
    window.clearTimeout(endRevealTimer);
    endRevealTimer = null;
  }
  lastRenderedSlideId = slide.id;
  elements.slideCounter.textContent = `${state.slideIndex + 1} / ${WEEK5_SLIDES.length}`;
  updateFlowHighlight(slide);
  updateHintPanel(slide);
  updatePreview(slide);
  updateTimer();
  updateTimerButtons();
  updateScore();
  updateSlideActionButtons(slide);
  updateMirrorChip();
  updateSoundButtons();
  applyAudioBySlide(slide);
  syncBeatSignalBySlide(slide);
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
    stopBeatSignal();
    applyAudioBySlide(currentSlide());
    syncBeatSignalBySlide(currentSlide());
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

async function submitWorkChoice(choiceIndex) {
  const slide = currentSlide();
  if (slide.kind !== "work" || !Array.isArray(slide.choices) || typeof slide.correctIndex !== "number") {
    return;
  }

  await ensureAudioReady();
  const isCorrect = choiceIndex === slide.correctIndex;
  if (isCorrect) {
    audio.playCorrect();
  } else {
    audio.playIncorrect();
  }

  setState({
    slideInteractions: setSlideInteraction(slide.id, {
      selectedChoice: choiceIndex,
      answeredAt: nowMs()
    }),
    fxEvent: makeFxEvent(isCorrect ? "correct" : "incorrect")
  });
}

async function goSubNext() {
  const slide = currentSlide();
  const maxStep = getSubStepMax(slide);
  if (maxStep <= 0) {
    await goNext();
    return;
  }
  await ensureAudioReady();
  if (slide.kind === "end") {
    const currentStep = Number(getSlideInteraction(slide.id).subStep ?? 0);
    if (currentStep > 0) {
      return;
    }
    audio.playEndFanfare();
    if (endRevealTimer) {
      window.clearTimeout(endRevealTimer);
      endRevealTimer = null;
    }
    setState({
      slideInteractions: setSlideInteraction(slide.id, {
        subStep: 1,
        endRevealAt: null
      })
    });
    endRevealTimer = window.setTimeout(() => {
      const current = currentSlide();
      if (!current || current.id !== slide.id) {
        return;
      }
      setState({
        slideInteractions: setSlideInteraction(slide.id, {
          subStep: 1,
          endRevealAt: nowMs()
        })
      });
      endRevealTimer = null;
    }, END_CYMBAL_DELAY_MS);
    return;
  }

  const currentStep = Number(getSlideInteraction(slide.id).subStep ?? inferDefaultSubStep(slide));
  if (currentStep >= maxStep - 1) {
    await goNext();
    return;
  }
  audio.playNavigate();
  setState({
    slideInteractions: setSlideInteraction(slide.id, {
      subStep: currentStep + 1
    })
  });
}

async function goSubPrev() {
  const slide = currentSlide();
  const maxStep = getSubStepMax(slide);
  if (maxStep <= 0) {
    await goPrev();
    return;
  }
  await ensureAudioReady();
  if (slide.kind === "end") {
    if (endRevealTimer) {
      window.clearTimeout(endRevealTimer);
      endRevealTimer = null;
    }
    setState({
      slideInteractions: setSlideInteraction(slide.id, {
        subStep: 0,
        endRevealAt: null
      })
    });
    return;
  }
  const currentStep = Number(getSlideInteraction(slide.id).subStep ?? inferDefaultSubStep(slide));
  if (currentStep <= 0) {
    await goPrev();
    return;
  }
  audio.playNavigate();
  setState({
    slideInteractions: setSlideInteraction(slide.id, {
      subStep: currentStep - 1
    })
  });
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

async function pauseTimer() {
  await ensureAudioReady();
  audio.playToggle();
  setState({
    timerOffsetSec: lessonElapsedSeconds(),
    timerRunning: false,
    timerStartedAt: null
  });
}

async function toggleTimer() {
  if (state.timerRunning) {
    await pauseTimer();
    return;
  }
  await startOrResumeTimer();
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
    if (event.shiftKey) {
      goNext();
      return;
    }
    goSubNext();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (event.shiftKey) {
      goPrev();
      return;
    }
    goSubPrev();
  }
}

async function setupControls() {
  elements.nextButton.addEventListener("click", goNext);

  elements.prevButton.addEventListener("click", goPrev);

  if (elements.timerToggleButton) {
    elements.timerToggleButton.addEventListener("click", toggleTimer);
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

  if (elements.lessonResetButton) {
    elements.lessonResetButton.addEventListener("click", async () => {
      await ensureAudioReady();
      audio.playNavigate();
      state = createFreshLessonState();
      render();
      bus.publishState(state);
    });
  }

  if (elements.subPrevButton) {
    elements.subPrevButton.addEventListener("click", goSubPrev);
  }

  if (elements.subNextButton) {
    elements.subNextButton.addEventListener("click", goSubNext);
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
  if (!beatListenerBound) {
    audio.onBeat((beat) => {
      if (!audioReady) {
        return;
      }
      const slide = currentSlide();
      if (!slide || typeof slide.bpm !== "number" || slide.bpm <= 0) {
        return;
      }
      publishBeatSignal(beat.step16, beat.bpm, slide.id);
    });
    beatListenerBound = true;
  }

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

  bus.onSignal((signal) => {
    if (!signal || signal.name !== "work-choice") {
      return;
    }
    const payload = signal.payload || {};
    const slide = currentSlide();
    if (slide.kind !== "work" || payload.slideId !== slide.id) {
      return;
    }
    if (payload.choiceIndex !== 0 && payload.choiceIndex !== 1) {
      return;
    }
    submitWorkChoice(payload.choiceIndex);
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

  if (shouldResetOnLoad()) {
    state = createFreshLessonState();
  }

  render();
  bus.publishState(state);
}

bootstrap();

window.addEventListener("beforeunload", () => {
  if (endRevealTimer) {
    window.clearTimeout(endRevealTimer);
    endRevealTimer = null;
  }
  stopBeatSignal();
  window.removeEventListener("resize", fitRunnerScale);
  window.removeEventListener("keydown", handleArrowKey);
  audio.destroy();
  bus.close();
});
