import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { proxy: { '/api': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (
            id.includes('react-grid-layout') ||
            id.includes('react-resizable') ||
            id.includes('react-draggable')
          )
            return 'grid'
          if (id.includes('@radix-ui')) return 'ui-primitives'
          if (
            id.includes('node_modules/react') ||
            id.includes('@tanstack/react-query') ||
            id.includes('zustand')
          )
            return 'react-core'
        },
      },
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', css: true },
})
