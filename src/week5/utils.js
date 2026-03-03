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

function inferAppRootPathname(pathname) {
  const normalizedPathname =
    typeof pathname === "string" && pathname.startsWith("/") ? pathname : `/${String(pathname ?? "")}`;
  const markers = ["/week1/", "/week5/", "/mockup/", "/assets/"];
  let markerIndex = -1;

  markers.forEach((marker) => {
    const index = normalizedPathname.indexOf(marker);
    if (index === -1) {
      return;
    }
    if (markerIndex === -1 || index < markerIndex) {
      markerIndex = index;
    }
  });

  if (markerIndex >= 0) {
    return normalizedPathname.slice(0, markerIndex + 1);
  }

  const lastSlash = normalizedPathname.lastIndexOf("/");
  if (lastSlash >= 0) {
    return normalizedPathname.slice(0, lastSlash + 1);
  }

  return "/";
}

function resolveAppBaseUrl() {
  const href = currentHref();
  const current = new URL(href);
  const appRootPath = inferAppRootPathname(current.pathname);
  return new URL(appRootPath, current.origin);
}

export function resolveAppUrl(pathname) {
  const normalizedPath = normalizeAppRelativePath(pathname);
  return new URL(normalizedPath, resolveAppBaseUrl()).toString();
}

export function resolveAppPath(pathname) {
  return new URL(resolveAppUrl(pathname)).pathname;
}
