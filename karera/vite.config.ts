import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    proxy: {
      "/race": {
        target: "http://127.0.0.1:3001",
        ws: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
