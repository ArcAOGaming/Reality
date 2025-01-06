import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import webfontDownload from "vite-plugin-webfont-dl";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// https://vitejs.dev/config/
export default defineConfig({
  build: {},
  base: '/',
  plugins: [nodePolyfills(),react(), webfontDownload(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
