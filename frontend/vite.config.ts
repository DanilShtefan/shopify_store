import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Прокси для API запросов на Django backend
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Code splitting настройки
    rollupOptions: {
      output: {
        // Разделение чанков по типам
        manualChunks: {
          // React и основные библиотеки в отдельный чанк
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI библиотеки
          'ui-vendor': ['lucide-react', 'react-error-boundary'],
          // HTTP клиент
          'http-vendor': ['axios'],
        },
      },
    },
    // Разделение чанков по размеру
    chunkSizeWarningLimit: 500,
    // Минимизация
    minify: 'esbuild',
    // Sourcemaps для отладки (отключить в production)
    sourcemap: false,
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react'],
  },
})
