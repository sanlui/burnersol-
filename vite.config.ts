import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {nodePolyfills} from 'vite-plugin-node-polyfills';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'solana': ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
          'ui': ['lucide-react', 'recharts', '@keystonehq/sdk'],
        },
      },
    },
    target: 'es2020',
    minify: 'esbuild',
  },
  assetsInclude: ['**/*.webp'],
});
