'use strict';

// Mirrors styled-components: CJS file with __esModule: true, a callable default
// export, and named exports that differ from the default.
Object.defineProperty(exports, '__esModule', { value: true });

const fn = function fn(arg) {
  return arg;
};
fn.div = function (strings) {
  return strings;
};

exports.default = fn;
exports.namedFn = fn;
