import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(() => ({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        week1Runner: resolve(__dirname, "week1/runner.html"),
        week1Bigscreen: resolve(__dirname, "week1/big-screen.html"),
        week9Runner: resolve(__dirname, "week9/runner.html"),
        week9Bigscreen: resolve(__dirname, "week9/big-screen.html"),
        runner: resolve(__dirname, "week5/runner.html"),
        bigscreen: resolve(__dirname, "week5/big-screen.html")
      }
    }
  }
}));
