import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],

  build:{
    outDir: '../server/public/admin',
    emptyOutDir: true,
    rollupOptions: {
      output:{
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    cssCodeSplit: false,
    minify: 'esbuild',
    copyPublicDir: true,
  },

  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api' : {
        target: 'http://localhost/painel-informativo/server/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')

      },
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
  },

  css: {
    devSourcemap: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
