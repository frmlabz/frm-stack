import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import topLevelAwait from "vite-plugin-top-level-await";
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Port resolution: WEB_PORT (from .env.worktree via shell) > PORT (from .env) > 4000
  const port = Number(process.env.WEB_PORT || env.WEB_PORT || env.PORT || 4000);
  const apiPort = process.env.API_PORT || env.API_PORT || "8080";
  // Construct API URLs from port if not explicitly set
  if (!env.VITE_API_URL) process.env.VITE_API_URL = `http://localhost:${apiPort}`;
  if (!env.VITE_AUTH_URL) process.env.VITE_AUTH_URL = `http://localhost:${apiPort}`;
  return {
    build: {
      outDir: "dist",
    },
    plugins: [tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }), react(), tailwindcss(), tsconfigPaths(), topLevelAwait()],
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
    },
  };
});
