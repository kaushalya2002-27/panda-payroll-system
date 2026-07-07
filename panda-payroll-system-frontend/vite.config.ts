import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@mui/material')) {
            return 'mui-core';
          }
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'mui-icons';
          }
          if (id.includes('node_modules/@emotion')) {
            return 'emotion';
          }
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          if (id.includes('node_modules/quill') || id.includes('node_modules/react-quill') || id.includes('RichText')) {
            return 'richtext';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
        }
      }
    }
  }
})