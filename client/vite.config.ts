import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// HTTP en local (http://localhost:5173) — évite mixed content avec le backend :8000
// Pour la caméra mobile en HTTPS : npm run dev:https (voir package.json)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
