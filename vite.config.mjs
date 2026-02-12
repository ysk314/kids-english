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
        runner: resolve(__dirname, "week5-runner.html"),
        bigscreen: resolve(__dirname, "week5-big-screen.html")
      }
    }
  }
}));
