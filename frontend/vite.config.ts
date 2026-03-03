import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite"; // <--- Importante
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(), // <--- Debe ir antes de reactRouter()
    reactRouter(), 
    tsconfigPaths()
  ],
});