import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/api-client-react': path.resolve(__dirname, './src/lib-stub.ts'),
      '@workspace/analytics': path.resolve(__dirname, './src/lib-stub.ts'),
      '@vercel/analytics/react': path.resolve(__dirname, './src/lib-stub.ts')
    }
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true
  }
})
