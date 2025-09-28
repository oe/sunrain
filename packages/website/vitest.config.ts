import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    pool: 'forks',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'test/unit/**/*.test.{ts,tsx}',
      'test/unit/**/*.spec.{ts,tsx}'
    ],
    poolOptions: {
      threads: {
        maxThreads: 1,
        minThreads: 1
      }
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/src/test/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'public/',
        'src/locales/',
        'src/client-locales/',
        'src/pages/',
        'src/layouts/',
        'src/content/',
        'src/scripts/',
        'src/reports/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@sunrain/shared': resolve(__dirname, '../shared/src')
    }
  }
});
