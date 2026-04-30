import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(() => {
  const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';

  return {
    base: isGhPages ? '/outsource-dashboard/' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },

    server: {
      port: 3000,
      open: true,
      strictPort: true,
      historyApiFallback: true,
    },

    preview: {
      port: 8080,
      open: true,
    },
  };
});