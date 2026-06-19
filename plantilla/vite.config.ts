import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  server: {
    port: 3001,
    // SPA fallback: serve index.html for all 404s so that /productos, /nosotros, etc. work on refresh
    historyApiFallback: true,
  },
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
});
