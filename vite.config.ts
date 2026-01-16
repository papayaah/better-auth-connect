import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ] as unknown as PluginOption[],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'server/nextjs': resolve(__dirname, 'src/server/nextjs/index.ts'),
        'server/node': resolve(__dirname, 'src/server/node/index.ts'),
        'server/fetch': resolve(__dirname, 'src/server/fetch/index.ts'),
        'presets/tailwind': resolve(__dirname, 'src/presets/tailwind.tsx'),
        'presets/mantine': resolve(__dirname, 'src/presets/mantine.tsx'),
        'presets/default': resolve(__dirname, 'src/presets/default.tsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'better-auth',
        'better-auth/react',
        'better-auth/next-js',
        'better-auth/node',
        'next/headers',
        'next/server',
        '@mantine/core',
        '@mantine/hooks',
        'lucide-react',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
