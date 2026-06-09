# Summary of rolldown Bug Report

## Issue

When building CJS output, a default import of an external CJS module that sets `__esModule: true` produces different `__toESM` calls depending solely on the importing file's extension:

- `.ts` file → `__toESM(mod, 1)` — `isNodeMode = 1`
- `.tsx` file → `__toESM(mod)` — no `isNodeMode`

The two source files in this repro (`src/from-ts.ts` and `src/from-tsx.tsx`) are **byte-for-byte identical** in content. Only the extension differs.

```js
// lib/from-ts.js  ← .ts source
mock_cjs = require_chunk.__toESM(mock_cjs, 1);  // isNodeMode = 1  ❌

// lib/from-tsx.js ← .tsx source
mock_cjs = require_chunk.__toESM(mock_cjs);      // correct         ✅
```

This is a runtime bug, not just a cosmetic difference. When `isNodeMode = 1`, `__toESM` always sets `default: mod` (the whole exports object), ignoring `__esModule: true`. So `mod.default` becomes the entire module object instead of the actual default export. For packages where `mod !== mod.default` (e.g. styled-components, @loadable/component), any call like `(0, mod.default)(arg)` throws `TypeError: mod.default is not a function`.

## Root Cause

Unknown. Rolldown appears to choose the `isNodeMode` argument based on something that differs between `.ts` and `.tsx` files, but the actual discriminator in the code generation path is not clear from the outside. The external module (`mock-cjs`) is a plain CJS file with no `exports` field and no `"type": "module"`, identical to packages like `styled-components`.

## Proposed Solution

`.ts` and `.tsx` files should produce the same `__toESM` call for the same default import. Rolldown should not pass `isNodeMode = 1` for a CJS module that sets `__esModule: true`, regardless of the importing file's extension.

## Steps to reproduce

```sh
npm install
npm run build
npm run check
```

Expected output (both lines identical, no `1`):
```
lib/from-ts.js:  mock_cjs = require_chunk.__toESM(mock_cjs);
lib/from-tsx.js: mock_cjs = require_chunk.__toESM(mock_cjs);
```

Actual output:
```
lib/from-ts.js:  mock_cjs = require_chunk.__toESM(mock_cjs, 1);  ← isNodeMode=1
lib/from-tsx.js: mock_cjs = require_chunk.__toESM(mock_cjs);
```

## Environment

- rolldown: 1.1.0
- Node.js: v22+
- Package `"type": "module"`
