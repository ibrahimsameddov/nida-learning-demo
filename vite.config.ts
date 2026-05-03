import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "react-hot-toast": fileURLToPath(new URL("./src/lib/toast-shim.tsx", import.meta.url)),
      "framer-motion":   fileURLToPath(new URL("./src/lib/motion-shim.tsx", import.meta.url)),
    },
  },
});
