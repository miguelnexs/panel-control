import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve('src/main/index.js')
        },
        output: {
          format: 'cjs',
          preserveModules: true,
          exports: 'auto'
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
    ],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.js')
        },
        output: {
          format: 'cjs',
          preserveModules: true,
          exports: 'auto'
        }
      }
    }
  },
  renderer: {
    root: resolve('src/renderer'),
    build: {
      outDir: 'out/renderer'
    },
    server: {
      hmr: {
        overlay: false
      }
    },
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          postcssImport(),
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  }
})