/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
  },
  test: {
    // setupTests.ts registers the maplibre-gl / export-control mocks and DOM
    // polyfills; without this block Vitest never loads it (and defaults to the
    // node environment), which is why component tests importing the map failed.
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Public-root asset imports (e.g. `/images/foo.svg`) are served by Vite at
    // runtime and aren't real modules; alias them to a stub for tests only.
    alias: [
      {
        find: /^\/images\/.*$/,
        replacement: fileURLToPath(new URL('./src/test/asset-stub.ts', import.meta.url)),
      },
    ],
  },
})

