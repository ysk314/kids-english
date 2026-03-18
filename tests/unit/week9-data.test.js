import { describe, expect, it } from "vitest";
import {
  FLOW_STEPS,
  LESSON_GOALS,
  PREDICATES,
  SUBJECTS,
  WEEK9_SLIDES,
  WORK_COMBINATIONS,
  WORK_PHASES,
  buildSentenceByIndex,
  getPredicatePool,
  getWorkDisplayState
} from "../../src/week9/lessonData.js";

describe("week9 lesson data", () => {
  it("has exactly 21 slides in the simplified flow", () => {
    expect(WEEK9_SLIDES).toHaveLength(21);
  });

  it("contains all required slide blocks", () => {
    const countByPrefix = (prefix) =>
      WEEK9_SLIDES.filter((slide) => slide.id.startsWith(prefix)).length;
    const countByPattern = (pattern) =>
      WEEK9_SLIDES.filter((slide) => pattern.test(slide.id)).length;

    expect(countByPrefix("11_theme_title")).toBe(1);
    expect(countByPattern(/^12_jp_rhythm_[1-7]$/)).toBe(7);
    expect(countByPrefix("12_jp_rhythm_to_work")).toBe(1);
    expect(countByPrefix("13_jp_work_1")).toBe(1);
    expect(countByPrefix("15_jp_to_en_start")).toBe(1);
    expect(countByPattern(/^16_en_rhythm_[1-7]$/)).toBe(7);
    expect(countByPrefix("16_en_rhythm_to_work")).toBe(1);
    expect(countByPrefix("17_en_work_1")).toBe(1);
    expect(countByPrefix("20_end")).toBe(1);
  });

  it("keeps four flow steps and three lesson goals", () => {
    expect(FLOW_STEPS).toHaveLength(4);
    expect(LESSON_GOALS).toHaveLength(3);
  });

  it("builds 42 non-original work combinations with image references", () => {
    expect(SUBJECTS).toHaveLength(7);
    expect(PREDICATES).toHaveLength(7);
    expect(WORK_COMBINATIONS).toHaveLength(42);

    const ids = WORK_COMBINATIONS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(WORK_COMBINATIONS.every((item) => /\/[^/]+_is_[^/]+\.png$/.test(item.imagePath))).toBe(true);
    expect(WORK_COMBINATIONS.every((item) => item.subjectIndex !== item.predicateIndex)).toBe(true);
  });

  it("gives six predicate options per subject and excludes the original pairing", () => {
    SUBJECTS.forEach((_, index) => {
      const pool = getPredicatePool(index);
      expect(pool).toHaveLength(6);
      expect(pool.includes(index)).toBe(false);
    });
  });

  it("resolves a revealed work sentence from roulette state", () => {
    const display = getWorkDisplayState(
      {
        subStep: WORK_PHASES.REVEALED,
        subjectIndex: 0,
        predicateIndex: 1
      },
      "jp",
      0
    );

    expect(display.sentence).toBe(buildSentenceByIndex(0, 1, "jp"));
    expect(display.comboId).toBe("mutsumi-sensei__insect");
  });
});
