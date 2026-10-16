/**
 * Bridge `markdown-it-github-alerts` into Hexo's markdown-it renderer.
 *
 * That plugin is published as ESM only (`"type": "module"`, no CJS build), so
 * it cannot simply be listed under `markdown.markdown.plugins:` — Hexo's
 * renderer would hand markdown-it the module namespace object and fail with
 * "plugin.apply is not a function". Requiring it here and unwrapping
 * `.default` sidesteps that.
 *
 * The package is optional. When it is not installed this file does nothing,
 * and `> [!NOTE]` blocks simply stay ordinary blockquotes.
 *
 * Setup (site `_config.yml`):
 *
 *   markdown:
 *     render:
 *       html: true
 *     anchors:
 *       level: 2
 *
 * and in the site's package.json: hexo-renderer-markdown-it,
 * markdown-it-github-alerts.
 */

import type { HexoLike } from './types';

declare const hexo: HexoLike;
declare const require: (id: string) => unknown;

interface MarkdownIt {
  use(plugin: unknown, ...options: unknown[]): unknown;
}

try {
  const loaded = require('markdown-it-github-alerts') as { default?: unknown } | unknown;
  const plugin =
    loaded && typeof loaded === 'object' && 'default' in (loaded as Record<string, unknown>)
      ? (loaded as { default?: unknown }).default
      : loaded;

  if (typeof plugin === 'function') {
    hexo.extend.filter.register('markdown-it:renderer', (md: MarkdownIt) => {
      md.use(plugin);
    });
  }
} catch (_e) {
  // Optional dependency: not installed, nothing to bridge.
}
