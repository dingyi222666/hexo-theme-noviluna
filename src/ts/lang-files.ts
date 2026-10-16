/**
 * Language-file loading — pure filesystem work, NO top-level `hexo` reference
 * (see the note in i18n-core.ts for why that matters).
 *
 * Hexo does not expose `theme.i18n` to helpers, so `languages/*.yml` is read
 * directly. Results are cached per process, so this costs one disk read per
 * `hexo generate` rather than one per page.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';

import { LANGS, type Lang } from './i18n-core';

export type FlatDict = Record<string, string>;

const CACHE = new Map<string, FlatDict>();

function flatten(value: unknown, prefix: string, out: FlatDict): FlatDict {
  if (value === null || typeof value !== 'object') {
    out[prefix] = String(value);
    return out;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object') flatten(child, path, out);
    else out[path] = String(child);
  }
  return out;
}

/** Load one `languages/<lang>.yml` into a flat key → string map. */
export function loadLangFile(dir: string, lang: string): FlatDict {
  const key = join(dir, `${lang}.yml`);
  const cached = CACHE.get(key);
  if (cached) return cached;
  if (!existsSync(key)) return {};
  const flat = flatten(parseYaml(readFileSync(key, 'utf8')), '', {});
  CACHE.set(key, flat);
  return flat;
}

/** `{ en: {key: value}, "zh-CN": {…} }` for the given theme languages dir. */
export function loadLangs(themeDir: string): Record<string, FlatDict> {
  const dir = join(themeDir, 'languages');
  const out: Record<string, FlatDict> = {};
  for (const lang of LANGS as readonly Lang[]) out[lang] = loadLangFile(dir, lang);
  return out;
}
