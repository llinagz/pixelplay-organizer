import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "icon-pwa.png",
        "robots.txt",
      ],
      manifest: {
        name: "Backlog Pixel",
        short_name: "Backlog Pixel",
        description: "Tu organizador de ocio retro con estética pixel-art",
        theme_color: "#150E09",
        background_color: "#150E09",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icon-pwa.png",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icon-pwa.png",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cachear los assets estáticos del App Shell
        globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
        // No interceptar las peticiones de sincronización de Jazz (WebSocket)
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Las peticiones a Jazz Cloud no deben cachearse
            urlPattern: /^https:\/\/cloud\.jazz\.tools/,
            handler: "NetworkOnly",
          },
          {
            // Fuentes de Google (si se usan en el futuro)
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          jazz: ["jazz-tools", "jazz-tools/react"],
          motion: ["framer-motion"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-popover", "@radix-ui/react-tooltip"],
        },
      },
    },
  },
}));
