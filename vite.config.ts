import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 使用 ESM 配置，Vite v5 推荐
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  },
  server: {
    port: 5177
  }
});