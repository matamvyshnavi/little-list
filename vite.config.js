import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "LittleList",
        short_name: "LittleList",
        description: "Little tasks. Big progress. ✨",
        theme_color: "#8b5cf6",
        background_color: "#080714",
        display: "standalone",
      },
    }),
  ],
});