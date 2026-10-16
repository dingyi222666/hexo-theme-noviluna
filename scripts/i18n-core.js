"use strict";
/**
 * Pure i18n primitives — NO top-level `hexo` reference.
 *
 * Hexo wraps each file in the theme scripts directory in a function that
 * injects `hexo` as a parameter, but that injection does not reach modules
 * pulled in through a nested `require()`. Keeping the shared logic in a module
 * that never touches `hexo` makes it safe to import from any script, regardless
 * of the order Hexo happens to load them in.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGS = void 0;
exports.pageLang = pageLang;
exports.variant = variant;
exports.variants = variants;
exports.LANGS = ['en', 'zh-CN'];
/** Current render language, normalised to a supported code. */
function pageLang(ctx) {
    const raw = (ctx.page && (ctx.page.lang || ctx.page.language)) || ctx.config.language || 'en';
    return String(raw).indexOf('zh') === 0 ? 'zh-CN' : 'en';
}
/** One language's value from a bilingual config field. */
function variant(field, lang) {
    if (field === null || field === undefined || field === false)
        return '';
    if (typeof field === 'string')
        return field;
    if (typeof field === 'object') {
        const map = field;
        const own = map[lang];
        if (own !== null && own !== undefined)
            return String(own);
        if (lang !== 'en' && map.en !== null && map.en !== undefined)
            return String(map.en);
        if (lang !== 'zh-CN' && map['zh-CN'] !== null && map['zh-CN'] !== undefined) {
            return String(map['zh-CN']);
        }
        const first = Object.keys(map)[0];
        return first === undefined ? '' : String(map[first]);
    }
    return String(field);
}
/** Every language's value from a bilingual config field. */
function variants(field) {
    return { en: variant(field, 'en'), 'zh-CN': variant(field, 'zh-CN') };
}
