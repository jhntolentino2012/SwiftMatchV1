import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/analytics': path.resolve(__dirname, './src/lib-stub.ts'),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
})
