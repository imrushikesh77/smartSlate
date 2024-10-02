import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Set '@' as an alias for the 'src' directory
    },
  },
  server: {
    proxy: {
      '/calculate': {
        target: 'http://localhost:6277',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})