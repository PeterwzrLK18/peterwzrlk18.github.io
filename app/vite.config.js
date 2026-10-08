/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { pageMetadata } from './src/data/page-metadata.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdx(),
    {
      name: 'static-page-preview',
      configurePreviewServer(server) {
        // Match GitHub Pages directory redirects for generated route entries.
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url, 'http://localhost')
          if (url.pathname !== '/' && pageMetadata[url.pathname]) {
            response.writeHead(301, { Location: `${url.pathname}/${url.search}` })
            response.end()
            return
          }
          next()
        })
      },
    },
  ],
  test: {
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
    setupFiles: './src/setup-test.js',
  },
})
