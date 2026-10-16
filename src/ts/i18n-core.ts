/**
 * Pure i18n primitives — NO top-level `hexo` reference.
 *
 * Hexo wraps each file in the theme scripts directory in a function that
 * injects `hexo` as a parameter, but that injection does not reach modules
 * pulled in through a nested `require()`. Keeping the shared logic in a module
 * that never touches `hexo` makes it safe to import from any script, regardless
 * of the order Hexo happens to load them in.
 */

import type { HexoHelperContext, I18nField, LangMap } from './types';

export const LANGS = ['en', 'zh-CN'] as const;
export type Lang = (typeof LANGS)[number];

/** Current render language, normalised to a supported code. */
export function pageLang(ctx: HexoHelperContext): Lang {
  const raw =
    (ctx.page && (ctx.page.lang || ctx.page.language)) || ctx.config.language || 'en';
  return String(raw).indexOf('zh') === 0 ? 'zh-CN' : 'en';
}

/** One language's value from a bilingual config field. */
export function variant(field: I18nField, lang: Lang): string {
  if (field === null || field === undefined || field === false) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const map = field as Record<string, unknown>;
    const own = map[lang];
    if (own !== null && own !== undefined) return String(own);
    if (lang !== 'en' && map.en !== null && map.en !== undefined) return String(map.en);
    if (lang !== 'zh-CN' && map['zh-CN'] !== null && map['zh-CN'] !== undefined) {
      return String(map['zh-CN']);
    }
    const first = Object.keys(map)[0];
    return first === undefined ? '' : String(map[first]);
  }
  return String(field);
}

/** Every language's value from a bilingual config field. */
export function variants(field: I18nField): LangMap {
  return { en: variant(field, 'en'), 'zh-CN': variant(field, 'zh-CN') };
}
