"use strict";
/**
 * footer_meta(footer) — the single-line footer meta row.
 *
 * Composes the author / powered-by / ICP segments into ONE line joined by
 * a comma, in every supported language, so the client-side switcher can swap
 * the whole line without a reload:
 *
 *   { en: "Created by @n, Powered by Hexo & Noviluna",
 *     "zh-CN": "本站由 @n 创建，由 Hexo 强力驱动，主题为 Noviluna",
 *     current: <the page language's line, rendered server-side> }
 *
 * A segment is omitted entirely when its value is empty, so
 * `icp: { en: "" }` simply drops the ICP part from the English line.
 * The copyright and license lines are NOT part of this row.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeLine = composeLine;
const path_1 = require("path");
const i18n_core_1 = require("./i18n-core");
const lang_files_1 = require("./lang-files");
const HEXO_LINK = '<a href="https://hexo.io" target="_blank" rel="noopener">Hexo</a>';
const THEME_NAME = 'Noviluna';
/**
 * `en` reads with a comma + space; `zh-CN` with a full-width comma, which is
 * what the language files already use inside their own sentences.
 */
const SEPARATOR = { en: ', ', 'zh-CN': '，' };
/** Replace each `%s` in `template` with the matching entry of `args`. */
function fill(template, args) {
    if (!template)
        return '';
    let out = template;
    for (const arg of args)
        out = out.replace('%s', arg);
    return out;
}
/** Compose the meta line for one language, skipping empty segments. */
function composeLine(footer, dict, lang) {
    const segments = [];
    const author = (0, i18n_core_1.variant)(footer.author, lang);
    if (author)
        segments.push(fill(dict['footer.author'], [author]));
    if (footer.powered)
        segments.push(fill(dict['footer.powered'], [HEXO_LINK, THEME_NAME]));
    const icp = (0, i18n_core_1.variant)(footer.icp, lang);
    if (icp)
        segments.push(icp);
    return segments.join(SEPARATOR[lang]).trim();
}
function footerMeta(footer = {}) {
    const dir = (0, path_1.join)(hexo.theme_dir, 'languages');
    const en = composeLine(footer, (0, lang_files_1.loadLangFile)(dir, 'en'), 'en');
    const zh = composeLine(footer, (0, lang_files_1.loadLangFile)(dir, 'zh-CN'), 'zh-CN');
    return { en, 'zh-CN': zh, current: (0, i18n_core_1.pageLang)(this) === 'zh-CN' ? zh : en };
}
hexo.extend.helper.register('footer_meta', footerMeta);
