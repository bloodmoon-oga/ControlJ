import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Permite usar os imports absolutos do Next.js (ex: @/components/...")
    react(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // Caminho para o setup global
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
})
