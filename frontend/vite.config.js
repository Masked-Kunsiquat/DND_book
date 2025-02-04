import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Opens the browser on start
    port: 3000, // Dev server port
  },
  build: {
    outDir: "dist", // Output directory for the production build
  },
});
