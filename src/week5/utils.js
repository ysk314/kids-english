export const LESSON_DURATION_SECONDS = 45 * 60;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function formatLessonTimer(elapsedSeconds) {
  return `${formatClock(elapsedSeconds)} / ${formatClock(LESSON_DURATION_SECONDS)}`;
}

export function nowMs() {
  return Date.now();
}

export function resolveAppPath(pathname) {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return `${normalizedBase}${normalizedPath}`;
}
