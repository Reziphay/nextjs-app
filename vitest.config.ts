import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  plugins: [tsconfigPaths()],
  test: {
    css: true,
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.tsx"],
  },
});
