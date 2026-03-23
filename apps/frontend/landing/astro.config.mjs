import { defineConfig } from "astro/config";

// Port resolution: LANDING_PORT (from .env.worktree) > 4321 (Astro default)
const port = Number(process.env.LANDING_PORT || 4321);

export default defineConfig({
  output: "static",
  trailingSlash: "never",
  server: { port, strictPort: true },
});
