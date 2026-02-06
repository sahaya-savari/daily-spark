import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isCapacitor = mode === 'capacitor';

  return {
    base: isCapacitor ? './' : '/',

    server: {
      host: true,
      port: 8080,
      hmr: { overlay: false },
    },

    build: {
      // Optimize build output
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'capacitor': ['@capacitor/core', '@capacitor/local-notifications', '@capacitor/filesystem'],
          },
        },
      },
    },

    plugins: [
      react(),

      // PWA ONLY FOR WEB
      !isCapacitor &&
        VitePWA({
          registerType: 'autoUpdate',
          manifest: false,
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
