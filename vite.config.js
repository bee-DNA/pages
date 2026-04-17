import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 蜜蜂元基因體 API (Python 後端) - 開發時代理到本地或 Pi
      "/metagenomics": {
        target:
          process.env.VITE_METAGENOMICS_API_URL || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metagenomics/, ""),
      },
    },
  },
});
