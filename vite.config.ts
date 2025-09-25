import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    hmr: true, // asegúrate de que no esté en false
  },
  plugins: [react(), tsconfigPaths(), tailwindcss()],
});
