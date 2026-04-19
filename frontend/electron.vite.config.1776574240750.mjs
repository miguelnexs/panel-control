// electron.vite.config.mjs
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin()
    ],
    define: {
      "process.env.GH_TOKEN": JSON.stringify(process.env.GH_TOKEN)
    },
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: {
          index: resolve("src/main/index.ts")
        },
        output: {
          format: "cjs",
          preserveModules: true,
          exports: "auto"
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: resolve("src/preload/index.ts")
        },
        output: {
          format: "cjs",
          preserveModules: true,
          exports: "auto"
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@": resolve("src/renderer/src")
      }
    },
    root: resolve("src/renderer"),
    build: {
      outDir: "out/renderer"
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
