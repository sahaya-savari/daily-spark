import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isCapacitor = mode === 'capacitor';
  const base = process.env.VITE_BASE_PATH ?? (isCapacitor ? './' : '/');

  return {
    base,

    server: {
      host: true,
      port: 8080,
    },

    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
