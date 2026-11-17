import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['test/**/*.e2e-spec.ts', 'src/**/*.test.ts'] },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
