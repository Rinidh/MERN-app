import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // <-- error
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "__tests__/setup.ts",
    slowTestThreshold: 1000,
  },
});
