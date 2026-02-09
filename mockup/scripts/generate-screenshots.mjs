import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const screensDir = path.join(rootDir, "screens");
const outputDir = path.join(rootDir, "output");

const targets = ["03_lesson_runner"];
targets.push("11_theme_title");

for (let i = 1; i <= 4; i += 1) {
  targets.push(`12_jp_rhythm_${i}`);
}
targets.push("12_jp_rhythm_summary");
targets.push("12_jp_break_work");
for (let i = 1; i <= 8; i += 1) {
  targets.push(`13_jp_work_${i}`);
}
targets.push("13_jp_break_deep");
for (let i = 1; i <= 4; i += 1) {
  targets.push(`14_jp_deep_step_${i}`);
}
for (let i = 1; i <= 4; i += 1) {
  targets.push(`15_jp_deep_compare_${i}`);
}
targets.push("15_break_en_start");
for (let i = 1; i <= 4; i += 1) {
  targets.push(`16_en_rhythm_${i}`);
}
targets.push("16_en_rhythm_summary");
targets.push("16_en_break_work");
for (let i = 1; i <= 8; i += 1) {
  targets.push(`17_en_work_${i}`);
}
targets.push("17_en_break_deep");
for (let i = 1; i <= 4; i += 1) {
  targets.push(`18_en_deep_step_${i}`);
}
for (let i = 1; i <= 4; i += 1) {
  targets.push(`19_en_deep_compare_${i}`);
}
targets.push("20_end");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });

for (const name of targets) {
  const htmlPath = path.join(screensDir, `${name}.html`);
  const url = `file://${htmlPath}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const targetPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: targetPath, fullPage: true });
  console.log(`captured: ${targetPath}`);
}

await browser.close();
