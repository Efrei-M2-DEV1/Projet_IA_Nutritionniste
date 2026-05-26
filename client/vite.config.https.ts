import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Variante HTTPS (caméra mobile) — nécessite le proxy, pas VITE_API_URL=http://localhost:8000 */
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true, secure: false },
      "/health": { target: "http://localhost:8000", changeOrigin: true, secure: false },
    },
  },
});
