import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        compatConfig: {
          MODE: 3,
        },
      },
    },
  })],
  resolve: {
    // https://vitejs.dev/config/shared-options.html#resolve-alias
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: '@vue/compat'
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  define: {
    'process.env.IS_ELECTRON': JSON.stringify(process.env),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  dev: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  }
});
