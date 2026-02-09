import { test, expect } from "playwright/test";

test.describe("week5 runner", () => {
  test("moves slide and updates points", async ({ page }) => {
    await page.goto("/week5-runner.html?session=e2e-runner");

    await expect(page.getByTestId("slide-counter")).toHaveText("1 / 49");

    await page.getByTestId("next-btn").click();
    await expect(page.getByTestId("slide-counter")).toHaveText("2 / 49");

    await page.getByTestId("student-point-btn").click();
    await expect(page.getByTestId("student-points")).toHaveText("1");

    await page.getByTestId("teacher-point-btn").click();
    await expect(page.getByTestId("teacher-points")).toHaveText("1");

    await expect(page.getByTestId("hint-id")).toHaveText("12_jp_rhythm_1");
  });

  test("syncs big screen slide via shared session", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
    const runner = await context.newPage();
    const big = await context.newPage();

    await runner.goto("/week5-runner.html?session=e2e-sync");
    await big.goto("/week5-big-screen.html?session=e2e-sync");

    await expect(runner.getByText("Mirror Connected")).toBeVisible();

    await runner.getByTestId("next-btn").click();
    await runner.getByTestId("next-btn").click();
    await runner.getByTestId("student-point-btn").click();
    await runner.getByTestId("teacher-point-btn").click();

    await expect(big.getByTestId("bigscreen-count")).toHaveText("3 / 49");
    await expect(big.getByTestId("bigscreen-frame")).toHaveAttribute(
      "src",
      /12_jp_rhythm_2\.html/
    );
    await expect(big.getByTestId("bigscreen-points")).toContainText("みんな 1");
    await expect(big.getByTestId("bigscreen-points")).toContainText("むつみ先生 1");

    await context.close();
  });
});
