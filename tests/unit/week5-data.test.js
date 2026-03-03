import { describe, expect, it } from "vitest";
import { FLOW_STEPS, LESSON_GOALS, WEEK5_SLIDES } from "../../src/week5/lessonData.js";

describe("week5 lesson data", () => {
  it("has exactly 43 slides including title, summary, break, and end slides", () => {
    expect(WEEK5_SLIDES).toHaveLength(43);
  });

  it("contains all required phase blocks", () => {
    const countByPrefix = (prefix) =>
      WEEK5_SLIDES.filter((slide) => slide.id.startsWith(prefix)).length;
    const countByPattern = (pattern) =>
      WEEK5_SLIDES.filter((slide) => pattern.test(slide.id)).length;

    expect(countByPrefix("11_theme_title")).toBe(1);
    expect(countByPattern(/^12_jp_rhythm_(?:[1-4]|summary)$/)).toBe(5);
    expect(countByPrefix("12_jp_rhythm_to_work")).toBe(1);
    expect(countByPattern(/^13_jp_work_[1-8]$/)).toBe(8);
    expect(countByPrefix("13_jp_work_to_deep")).toBe(1);
    expect(countByPrefix("14_jp_deep_step_")).toBe(4);
    expect(countByPrefix("15_jp_deep_compare_")).toBe(1);
    expect(countByPrefix("15_jp_to_en_start")).toBe(1);
    expect(countByPattern(/^16_en_rhythm_(?:[1-4]|summary)$/)).toBe(5);
    expect(countByPrefix("16_en_rhythm_to_work")).toBe(1);
    expect(countByPattern(/^17_en_work_[1-8]$/)).toBe(8);
    expect(countByPrefix("17_en_work_to_deep")).toBe(1);
    expect(countByPrefix("18_en_deep_step_")).toBe(4);
    expect(countByPrefix("19_en_deep_compare_")).toBe(1);
    expect(countByPrefix("20_end")).toBe(1);
  });

  it("has unique slide ids and hint payload", () => {
    const ids = WEEK5_SLIDES.map((slide) => slide.id);
    expect(new Set(ids).size).toBe(ids.length);

    WEEK5_SLIDES.forEach((slide) => {
      expect(slide.hint.title.length).toBeGreaterThan(0);
      expect(slide.hint.aim.length).toBeGreaterThan(0);
      expect(slide.hint.script.length).toBeGreaterThan(0);
      expect(slide.screenPath.endsWith(`${slide.id}.html`)).toBe(true);
    });
  });

  it("keeps six flow steps and three lesson goals", () => {
    expect(FLOW_STEPS).toHaveLength(6);
    expect(LESSON_GOALS).toHaveLength(3);
  });

  it("uses rhythm bpm for deep compare slides and train wording in deep step", () => {
    const jpDeepCompare = WEEK5_SLIDES.filter((slide) => slide.id.startsWith("15_jp_deep_compare_"));
    const enDeepCompare = WEEK5_SLIDES.filter((slide) => slide.id.startsWith("19_en_deep_compare_"));
    expect(jpDeepCompare.every((slide) => slide.bpm === 90)).toBe(true);
    expect(enDeepCompare.every((slide) => slide.bpm === 95)).toBe(true);

    const jpDeepStep4 = WEEK5_SLIDES.find((slide) => slide.id === "14_jp_deep_step_4");
    const enDeepStep4 = WEEK5_SLIDES.find((slide) => slide.id === "18_en_deep_step_4");
    expect(jpDeepStep4?.hint.script).toContain("でんしゃ");
    expect(enDeepStep4?.hint.script).toContain("train");
  });
});
