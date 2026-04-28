import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/preview/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
    },
  },
}))
