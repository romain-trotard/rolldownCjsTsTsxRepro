import { defineConfig } from 'rolldown';

export default defineConfig({
  input: ['src/from-ts.ts', 'src/from-tsx.tsx'],
  external: ['mock-cjs'],
  output: {
    dir: 'lib',
    format: 'cjs',
  },
});
