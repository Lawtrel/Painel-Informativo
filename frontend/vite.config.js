import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: '../../server/public/admin',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        login: 'src/login.html',
        index: 'src/index.html',
        dashboard: 'src/dashboard.html',
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.fileName || assetInfo.name || '';
          
          if (/\.(css)$/.test(fileName)) {
            return 'css/[name]-[hash].[ext]';
          }
          if (/\.(woff|woff2|ttf|eot)$/.test(fileName)) {
            return 'fonts/[name]-[hash].[ext]';
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(fileName)) {
            return 'images/[name]-[hash].[ext]';
          }
          
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  publicDir: '../public',
});
