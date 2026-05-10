import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split("\\").join("/");
          const isPackage = (packageName: string) =>
            normalizedId.includes(`/node_modules/${packageName}/`);

          if (!normalizedId.includes("/node_modules/")) return undefined;

          if (
            isPackage("react") ||
            isPackage("react-dom") ||
            isPackage("react-router") ||
            isPackage("react-router-dom") ||
            isPackage("scheduler")
          ) {
            return "vendor-react";
          }
          if (isPackage("@tanstack/react-query")) return "vendor-query";
          if (
            isPackage("recharts") ||
            isPackage("victory-vendor") ||
            isPackage("d3-array") ||
            isPackage("d3-color") ||
            isPackage("d3-ease") ||
            isPackage("d3-format") ||
            isPackage("d3-interpolate") ||
            isPackage("d3-path") ||
            isPackage("d3-scale") ||
            isPackage("d3-shape") ||
            isPackage("d3-time") ||
            isPackage("d3-time-format") ||
            isPackage("d3-timer") ||
            isPackage("decimal.js-light")
          ) {
            return "vendor-charts";
          }
          if (normalizedId.includes("/node_modules/@radix-ui/")) return "vendor-radix";
          if (isPackage("lucide-react")) return "vendor-icons";
          if (
            isPackage("react-hook-form") ||
            normalizedId.includes("/node_modules/@hookform/") ||
            isPackage("zod")
          ) {
            return "vendor-forms";
          }
          return undefined;
        },
      },
    },
  },
});
