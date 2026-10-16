"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_core_1 = require("./i18n-core");
function i18nText(field) {
    return (0, i18n_core_1.variant)(field, (0, i18n_core_1.pageLang)(this));
}
/**
 * Hexo passes template arguments positionally, so `field` arrives as the first
 * argument (`this` is the render context, which this helper does not need).
 * `i18n_text` is the opposite: it reads the language off `this`.
 */
function i18nVariants(field) {
    return (0, i18n_core_1.variants)(field);
}
hexo.extend.helper.register('i18n_text', i18nText);
hexo.extend.helper.register('i18n_variants', i18nVariants);
