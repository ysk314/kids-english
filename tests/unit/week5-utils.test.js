import { describe, expect, it } from "vitest";
import { LESSON_DURATION_SECONDS, clamp, formatClock, formatLessonTimer } from "../../src/week5/utils.js";

describe("week5 utilities", () => {
  it("clamps values", () => {
    expect(clamp(3, 0, 10)).toBe(3);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("formats clock mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(2722)).toBe("45:22");
  });

  it("formats lesson timer against 45 minutes", () => {
    expect(LESSON_DURATION_SECONDS).toBe(2700);
    expect(formatLessonTimer(0)).toBe("00:00 / 45:00");
    expect(formatLessonTimer(1122)).toBe("18:42 / 45:00");
  });
});
