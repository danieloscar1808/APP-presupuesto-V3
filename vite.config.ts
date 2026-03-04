import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({

  base: "/APP-presupuesto-V3/",

  plugins: [

    react(),

    mode === "development" && componentTagger(),

    VitePWA({
  registerType: "autoUpdate",

  workbox: {
    maximumFileSizeToCacheInBytes: 20 * 1024 * 1024
  },

      manifest: {
        name: "Presupuesto V3",
        short_name: "Presupuesto",
        start_url: "/APP-presupuesto-V3/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1f3d63",

        icons: [
          {
            src: "/APP-presupuesto-V3/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/APP-presupuesto-V3/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          }
        ]
      }
    })

  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  build: {
    outDir: "docs",
    emptyOutDir: true
  }

}));