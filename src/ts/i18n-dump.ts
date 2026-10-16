/**
 * i18n_langs() — flattened `{ en: {key: value}, "zh-CN": {…} }` dump of the
 * theme language files, injected into every page by partials/head.ejs and read
 * by the client-side language switcher (source/js/lang.js).
 *
 * The YAML reading lives in the pure `lang-files` module; this file only
 * registers the helper and caches the result on the render context.
 */

import { loadLangs, type FlatDict } from './lang-files';
import type { HexoHelperContext, HexoLike } from './types';

declare const hexo: HexoLike;

function i18nLangs(this: HexoHelperContext): Record<string, FlatDict> {
  const ctx = this as HexoHelperContext & {
    _novilunaLangs?: Record<string, FlatDict>;
  };
  if (!ctx._novilunaLangs) {
    // `loadLangs` appends the `languages/` segment itself.
    ctx._novilunaLangs = loadLangs(hexo.theme_dir);
  }
  return ctx._novilunaLangs;
}

hexo.extend.helper.register('i18n_langs', i18nLangs);
