"use strict";
/**
 * i18n_langs() — flattened `{ en: {key: value}, "zh-CN": {…} }` dump of the
 * theme language files, injected into every page by partials/head.ejs and read
 * by the client-side language switcher (source/js/lang.js).
 *
 * The YAML reading lives in the pure `lang-files` module; this file only
 * registers the helper and caches the result on the render context.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const lang_files_1 = require("./lang-files");
function i18nLangs() {
    const ctx = this;
    if (!ctx._novilunaLangs) {
        // `loadLangs` appends the `languages/` segment itself.
        ctx._novilunaLangs = (0, lang_files_1.loadLangs)(hexo.theme_dir);
    }
    return ctx._novilunaLangs;
}
hexo.extend.helper.register('i18n_langs', i18nLangs);
