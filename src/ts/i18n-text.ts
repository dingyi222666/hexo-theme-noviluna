/**
 * i18n_text(field) / i18n_variants(field) — bilingual-capable config fields.
 *
 * A field is either a plain string (used as-is for every language) or a map
 * `{ en: "…", "zh-CN": "…" }`. An explicit empty string is preserved:
 * `{ en: "", zh-CN: "…" }` means "render nothing for en" — an intentional
 * hide, not a missing translation, so it must not fall through to the other
 * language.
 *
 * The logic itself lives in the pure `i18n-core` module; this file only wires
 * it into Hexo.
 */

import { pageLang, variant, variants } from './i18n-core';
import type { HexoHelperContext, HexoLike, I18nField, LangMap } from './types';

declare const hexo: HexoLike;

function i18nText(this: HexoHelperContext, field: I18nField): string {
  return variant(field, pageLang(this));
}

/**
 * Hexo passes template arguments positionally, so `field` arrives as the first
 * argument (`this` is the render context, which this helper does not need).
 * `i18n_text` is the opposite: it reads the language off `this`.
 */
function i18nVariants(field: I18nField): LangMap {
  return variants(field);
}

hexo.extend.helper.register('i18n_text', i18nText);
hexo.extend.helper.register('i18n_variants', i18nVariants);
