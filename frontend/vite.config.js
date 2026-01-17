import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('4.0.0'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('CHIMERA v4')
  }
})
