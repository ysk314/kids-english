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

function currentHref() {
  if (typeof window !== "undefined" && window.location && typeof window.location.href === "string") {
    return window.location.href;
  }
  return "http://localhost/";
}

function normalizeAppRelativePath(pathname) {
  const input = String(pathname ?? "");
  const raw = input.startsWith("/") ? input.slice(1) : input;
  const safeSegments = [];
  raw.split("/").forEach((segment) => {
    if (!segment || segment === ".") {
      return;
    }
    if (segment === "..") {
      if (safeSegments.length > 0) {
        safeSegments.pop();
      }
      return;
    }
    safeSegments.push(segment);
  });
  return safeSegments.join("/");
}

export function resolveAppPath(pathname) {
  const normalizedPath = normalizeAppRelativePath(pathname);
  const href = currentHref();
  const viteBase = import.meta.env?.BASE_URL;
  if (typeof viteBase === "string" && viteBase.length > 0) {
    const normalizedBase = viteBase.endsWith("/") ? viteBase : `${viteBase}/`;
    return new URL(`${normalizedBase}${normalizedPath}`, href).pathname;
  }
  return new URL(normalizedPath, href).pathname;
}
