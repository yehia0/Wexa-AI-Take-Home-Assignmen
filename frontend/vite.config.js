import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة عشان نقدر نقرأ الـ VITE_BACKEND_URL
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    base: './', // ضروري جداً عشان مسارات الفايلات تشتغل صح على Render
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:4000',
          changeOrigin: true,
        }
      }
    }
  }
})