import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    // Reuse the main app's Tailwind v4 entry so design tokens match.
    preprocessorMaxWorkers: 0,
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, "design-home.html"),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  // Only scan the design entry so the broken NewChatDialog is never parsed.
  optimizeDeps: {
    entries: ["design-home.html"],
  },
});