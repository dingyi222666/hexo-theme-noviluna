"use strict";
/**
 * Shared types for the Noviluna theme.
 *
 * The build-time half (src/ts/*) runs inside Hexo with only a hand-written
 * ambient `hexo` object, so these are structural types — just the surface the
 * theme actually touches, not the full Hexo API.
 *
 * The client half (src/client/*) reuses `ClientEnv`; that import is erased at
 * compile time (it is type-only), which is why the client bundle stays free of
 * `require()` calls.
 *
 * This module exports types only. `tsc` still emits `scripts/types.js`, an
 * empty CommonJS shim — harmless, and Hexo loads it as a no-op script.
 */
Object.defineProperty(exports, "__esModule", { value: true });
