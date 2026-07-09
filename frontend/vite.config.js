import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8003', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8003', changeOrigin: true },
    },
  },
  build: {
    sourcemap: false,
    // vendor-three (three.js + drei) is the one chunk over the default
    // 500kb warning threshold — it's expected and fine here since it's only
    // ever fetched on the lazy-loaded /3d-studio route, not the initial load.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor code into its own cacheable
        // chunks instead of one large main bundle — three.js/drei is only
        // needed on the (already lazy-loaded) 3D studio route.
        manualChunks: {
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
