import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@docsense/core': join(root, 'packages/core/src/index.ts'),
      '@docsense/indexer': join(root, 'packages/indexer/src/index.ts'),
      '@docsense/runtime': join(root, 'packages/runtime/src/index.ts'),
    },
  },
  test: {
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/**/*.test.ts',
        'packages/*/src/**/*.d.ts',
        'packages/docusaurus-plugin/src/theme/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
