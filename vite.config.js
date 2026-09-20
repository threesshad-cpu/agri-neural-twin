import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Charts
          'vendor-recharts': ['recharts'],
          // Maps
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
          // PDF / export
          'vendor-pdf': ['jspdf'],
          // UI utilities
          'vendor-ui': ['react-hot-toast', 'lucide-react'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
