import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  root: 'src',
  plugins: [
      react(),
    tailwindcss(),
  ],

  build:{
    outDir: '../admin',
    emptyOutDir: false,
    rollupOptions: {
      output:{
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    }
  },

  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/Painel-Informativo/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      '/Painel-Informativo/admin': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
