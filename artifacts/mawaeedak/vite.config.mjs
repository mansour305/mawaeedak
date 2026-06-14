import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "مواعيدك",
        short_name: "مواعيدك",
        description: "تطبيق ويب عربي لإدارة المواعيد والمواعيد المالية ومواقيت الصلاة",
        lang: "ar",
        dir: "rtl",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FAF7F2",
        theme_color: "#C9A063",
        categories: ["productivity", "lifestyle"],
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "/index.html",
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@api-client": path.resolve(__dirname, "src/lib/api-client"),
    },
  },
});
