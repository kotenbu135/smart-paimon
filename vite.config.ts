import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/smart-paimon/",
  build: { target: "esnext" },
  optimizeDeps: { exclude: ["@kotenbu/genshin-calc"] },
});
