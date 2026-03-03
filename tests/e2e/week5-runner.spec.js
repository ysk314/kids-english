import { test, expect } from "playwright/test";

const sid = (name) => `${name}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

test.describe("week5 runner", () => {
  test("moves slide and updates points", async ({ page }) => {
    await page.goto(`/week5/runner.html?session=${encodeURIComponent(sid("e2e-runner"))}`);

    await expect(page.getByTestId("slide-counter")).toHaveText("1 / 43");

    await page.getByTestId("next-btn").click();
    await expect(page.getByTestId("slide-counter")).toHaveText("2 / 43");

    await page.getByTestId("student-point-btn").click();
    await expect(page.getByTestId("student-points")).toHaveText("1");

    await page.getByTestId("teacher-point-btn").click();
    await expect(page.getByTestId("teacher-points")).toHaveText("1");

    await page.getByTestId("reset-points-btn").click();
    await expect(page.getByTestId("student-points")).toHaveText("0");
    await expect(page.getByTestId("teacher-points")).toHaveText("0");

    await expect(page.getByTestId("hint-id")).toHaveText("12_jp_rhythm_1");
  });

  test("syncs big screen slide via shared session", async ({ browser }) => {
    const session = sid("e2e-sync");
    const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
    const runner = await context.newPage();
    const big = await context.newPage();

    await runner.goto(`/week5/runner.html?session=${encodeURIComponent(session)}`);
    await big.goto(`/week5/big-screen.html?session=${encodeURIComponent(session)}`);

    await expect(runner.getByText("Mirror Connected")).toBeVisible();

    await runner.getByTestId("next-btn").click();
    await runner.getByTestId("next-btn").click();
    await runner.getByTestId("student-point-btn").click();
    await runner.getByTestId("teacher-point-btn").click();

    await expect(big.getByTestId("bigscreen-count")).toHaveText("3 / 43");
    await expect(big.getByTestId("bigscreen-frame")).toHaveAttribute(
      "src",
      /12_jp_rhythm_2\.html/
    );
    await expect(big.getByTestId("bigscreen-points")).toContainText("みんな 1");
    await expect(big.getByTestId("bigscreen-points")).toContainText("むつみ先生 1");

    await context.close();
  });

  test("supports timer toggle and reset controls", async ({ page }) => {
    await page.goto(`/week5/runner.html?session=${encodeURIComponent(sid("e2e-timer"))}`);

    await expect(page.getByTestId("timer-toggle-btn")).toHaveText("スタート▶︎");
    await expect(page.getByTestId("lesson-timer")).toHaveText("00:00 / 45:00");

    await page.getByTestId("timer-toggle-btn").click();
    await expect(page.getByTestId("timer-toggle-btn")).toHaveText("一時停止⏸️");
    await expect.poll(async () => page.getByTestId("lesson-timer").textContent()).not.toBe(
      "00:00 / 45:00"
    );

    await page.getByTestId("timer-toggle-btn").click();
    await expect(page.getByTestId("timer-toggle-btn")).toHaveText("スタート▶︎");
    const pausedValue = await page.getByTestId("lesson-timer").textContent();
    await page.waitForTimeout(1200);
    await expect(page.getByTestId("lesson-timer")).toHaveText(pausedValue ?? "00:00 / 45:00");

    await page.getByTestId("timer-reset-btn").click();
    await expect(page.getByTestId("lesson-timer")).toHaveText("00:00 / 45:00");
  });
});
